import type { ActionTree, Dispatch } from "vuex";
import { checkNodesExistence } from "@/lib/graphql";
import { createSpotifyPlayer, type PlayerErrorKind } from "@/lib/spotifyPlayer";
import { nodeFromSpotify } from "@/lib/spotifyNode";
import { statusOf } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { NodeInput } from "@/types/graph";
import type {
  RepeatState,
  SpotifyTrack,
  StartPlaybackOptions,
} from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import { addSongsWithNeighbors } from "../playlists/actions";
import type { NowPlaying, SpotifyPlayerState } from "./index";
import type { PlaybackUpdate } from "./mutations";

type Ctx = Context<SpotifyPlayerState>;

/** How often the state of another device is read, in milliseconds. */
const REMOTE_POLL_INTERVAL = 5000;
const REPEAT_ORDER: RepeatState[] = ["off", "context", "track"];

// The SDK player and the poll timer are not state: they must not become reactive or persisted.
let player: SpotifySdkPlayer | null = null;
let pollTimer: ReturnType<typeof setInterval> | undefined;

const userToken = (rootState: RootState) =>
  rootState.authentication.accessToken;

function fromSdkTrack(track: SpotifySdkTrack): NowPlaying {
  return {
    id: track.id,
    uri: track.uri,
    name: track.name,
    artists: track.artists.map((artist) => ({
      name: artist.name,
      id: artist.uri.split(":").pop(),
    })),
    albumName: track.album.name,
    images: track.album.images,
    durationMs: track.duration_ms,
  };
}

export function fromApiTrack(track: SpotifyTrack): NowPlaying {
  return {
    id: track.id,
    uri: track.uri,
    name: track.name,
    artists: (track.artists ?? []).map((artist) => ({
      name: artist.name,
      id: artist.id,
    })),
    albumName: track.album?.name ?? "",
    images: track.album?.images ?? [],
    durationMs: track.duration_ms ?? 0,
  };
}

/** Text for a failed Spotify Web API call. */
function describeError(error: unknown): string {
  const status = statusOf(error);
  const detail = (
    error as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data?.error?.message;
  if (status === 404)
    return "No active Spotify device. Open Spotify somewhere, or play in this tab.";
  if (status === 403) return detail ?? "Spotify Premium is needed for this.";
  if (status === 401) return "Your Spotify session expired. Log in again.";
  return (
    detail ??
    (error instanceof Error ? error.message : "The Spotify request failed")
  );
}

/**
 * Runs a Web API call with the user token. After a 401 it refreshes the token once and retries.
 * Errors go to the snackbar and the call returns undefined.
 */
async function withUserToken<T>(
  rootState: RootState,
  dispatch: Dispatch,
  call: (token: string) => Promise<T>,
): Promise<T | undefined> {
  try {
    return await call(userToken(rootState));
  } catch (error) {
    if (statusOf(error) === 401) {
      try {
        await dispatch("refreshToken");
        return await call(userToken(rootState));
      } catch (retryError) {
        dispatch("setError", new Error(describeError(retryError)));
        return undefined;
      }
    }
    dispatch("setError", new Error(describeError(error)));
    return undefined;
  }
}

function stopPolling() {
  if (pollTimer !== undefined) clearInterval(pollTimer);
  pollTimer = undefined;
}

export const actions = {
  /**
   * Makes this tab a Spotify Connect device ("out-of-tune") with the Web Playback SDK.
   * Needs a logged-in Premium account and a browser that can play DRM content.
   */
  async connectSpotifyPlayer({ state, rootState, commit, dispatch }: Ctx) {
    if (
      !rootState.authentication.loginState ||
      player ||
      state.status === "connecting"
    )
      return;
    const product = rootState.user.me.product;
    if (product && product !== "premium") {
      commit("SET_SPOTIFY_PLAYER_STATUS", "premium_required");
      return;
    }
    commit("SET_SPOTIFY_PLAYER_STATUS", "connecting");
    const onError = (kind: PlayerErrorKind, message: string) => {
      if (kind === "account")
        commit("SET_SPOTIFY_PLAYER_STATUS", "premium_required");
      else if (kind === "initialization")
        commit("SET_SPOTIFY_PLAYER_STATUS", "unavailable");
      else if (kind === "authentication")
        dispatch("refreshToken").catch(() => undefined);
      else if (kind === "autoplay")
        dispatch("setInfo", "Press play to start the music");
      else dispatch("setError", new Error(`Spotify: ${message}`));
    };
    try {
      player = await createSpotifyPlayer(
        () => userToken(rootState),
        {
          onReady: (deviceId) => {
            commit("SET_SPOTIFY_DEVICE_ID", deviceId);
            commit("SET_SPOTIFY_PLAYER_STATUS", "ready");
            dispatch("startRemotePolling");
          },
          onNotReady: () => commit("SET_SPOTIFY_DEVICE_ID", null),
          onState: (sdkState) => dispatch("applySdkState", sdkState),
          onError,
        },
        state.volume / 100,
      );
    } catch (error) {
      console.error(error);
      player = null;
      commit("SET_SPOTIFY_PLAYER_STATUS", "unavailable");
    }
  },

  disconnectSpotifyPlayer({ commit }: Ctx) {
    stopPolling();
    player?.disconnect();
    player = null;
    commit("RESET_SPOTIFY_PLAYER");
  },

  /** Player state events of this tab. `null` means another device took over. */
  applySdkState(
    { state, commit, dispatch }: Ctx,
    sdkState: SpotifySdkPlaybackState | null,
  ) {
    if (!sdkState) {
      commit("SET_SPOTIFY_PLAYBACK", {
        ...currentUpdate(state),
        isLocal: false,
      });
      dispatch("refreshPlaybackState");
      return;
    }
    const track = fromSdkTrack(sdkState.track_window.current_track);
    const trackChanged = track.id !== state.track?.id;
    commit("SET_SPOTIFY_PLAYBACK", {
      track,
      paused: sdkState.paused,
      positionMs: sdkState.position,
      shuffle: sdkState.shuffle,
      repeat: REPEAT_ORDER[sdkState.repeat_mode] ?? "off",
      isLocal: true,
      remoteDeviceName: null,
    } satisfies PlaybackUpdate);
    if (trackChanged) dispatch("checkLiked");
  },

  /** Reads the playback of any device. Used while another device plays. */
  async refreshPlaybackState({ state, rootState, commit, dispatch }: Ctx) {
    if (!rootState.authentication.loginState) return;
    let playback;
    try {
      playback = await SpotifyService.getPlaybackState(userToken(rootState));
    } catch {
      return;
    }
    if (!playback) {
      if (!state.isLocal)
        commit("SET_SPOTIFY_PLAYBACK", {
          ...currentUpdate(state),
          paused: true,
        });
      return;
    }
    const isLocal =
      playback.device.id !== null && playback.device.id === state.deviceId;
    const track = playback.item ? fromApiTrack(playback.item) : null;
    const trackChanged = track?.id !== state.track?.id;
    commit("SET_SPOTIFY_PLAYBACK", {
      track,
      paused: !playback.is_playing,
      positionMs: playback.progress_ms ?? 0,
      shuffle: playback.shuffle_state,
      repeat: playback.repeat_state,
      isLocal,
      remoteDeviceName: isLocal ? null : playback.device.name,
    } satisfies PlaybackUpdate);
    if (playback.device.volume_percent !== null)
      commit("SET_SPOTIFY_VOLUME", playback.device.volume_percent);
    if (trackChanged) dispatch("checkLiked");
  },

  startRemotePolling({ state, dispatch }: Ctx) {
    stopPolling();
    dispatch("refreshPlaybackState");
    pollTimer = setInterval(() => {
      // Events of the SDK keep a local playback up to date. Only other devices need polling.
      if (!state.isLocal && !document.hidden) dispatch("refreshPlaybackState");
    }, REMOTE_POLL_INTERVAL);
  },

  /**
   * Plays tracks or a context (album, artist, playlist). Plays in this tab unless another
   * device is active.
   */
  async spotifyPlay(
    { state, rootState, dispatch }: Ctx,
    options: Omit<StartPlaybackOptions, "deviceId">,
  ) {
    await player?.activateElement().catch(() => undefined);
    const deviceId = state.remoteDeviceName
      ? undefined
      : (state.deviceId ?? undefined);
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.startPlayback(token, { ...options, deviceId }),
    );
    setTimeout(() => dispatch("refreshPlaybackState"), 600);
  },

  async spotifyTogglePlay({ state, rootState, commit, dispatch }: Ctx) {
    if (state.isLocal && player) {
      await player.togglePlay();
      return;
    }
    const paused = state.paused;
    commit("SET_SPOTIFY_PAUSED", !paused);
    await withUserToken(rootState, dispatch, (token) =>
      paused
        ? SpotifyService.startPlayback(token, {})
        : SpotifyService.pausePlayback(token),
    );
  },

  async spotifyNext({ state, rootState, dispatch }: Ctx) {
    if (state.isLocal && player) await player.nextTrack();
    else
      await withUserToken(rootState, dispatch, (token) =>
        SpotifyService.skipToNext(token),
      );
    if (!state.isLocal) setTimeout(() => dispatch("refreshPlaybackState"), 600);
  },

  async spotifyPrevious({ state, rootState, dispatch }: Ctx) {
    if (state.isLocal && player) await player.previousTrack();
    else
      await withUserToken(rootState, dispatch, (token) =>
        SpotifyService.skipToPrevious(token),
      );
    if (!state.isLocal) setTimeout(() => dispatch("refreshPlaybackState"), 600);
  },

  async spotifySeek(
    { state, rootState, commit, dispatch }: Ctx,
    positionMs: number,
  ) {
    commit("SET_SPOTIFY_POSITION", positionMs);
    if (state.isLocal && player) await player.seek(positionMs);
    else
      await withUserToken(rootState, dispatch, (token) =>
        SpotifyService.seek(token, positionMs),
      );
  },

  async spotifySetVolume(
    { state, rootState, commit, dispatch }: Ctx,
    percent: number,
  ) {
    commit("SET_SPOTIFY_VOLUME", percent);
    if (state.isLocal && player) await player.setVolume(percent / 100);
    else
      await withUserToken(rootState, dispatch, (token) =>
        SpotifyService.setVolume(token, percent),
      );
  },

  async spotifyToggleShuffle({ state, rootState, commit, dispatch }: Ctx) {
    const shuffle = !state.shuffle;
    commit("SET_SPOTIFY_SHUFFLE", shuffle);
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.setShuffle(token, shuffle),
    );
  },

  async spotifyCycleRepeat({ state, rootState, commit, dispatch }: Ctx) {
    const repeat =
      REPEAT_ORDER[
        (REPEAT_ORDER.indexOf(state.repeat) + 1) % REPEAT_ORDER.length
      ];
    commit("SET_SPOTIFY_REPEAT", repeat);
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.setRepeat(token, repeat),
    );
  },

  async loadSpotifyDevices({ rootState, commit, dispatch }: Ctx) {
    const devices = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getDevices(token),
    );
    if (devices) commit("SET_SPOTIFY_DEVICES", devices);
  },

  /** Moves the playback to another device, or back to this tab. */
  async transferSpotifyPlayback(
    { state, rootState, dispatch }: Ctx,
    deviceId: string,
  ) {
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.transferPlayback(token, deviceId, !state.paused),
    );
    setTimeout(() => {
      dispatch("refreshPlaybackState");
      dispatch("loadSpotifyDevices");
    }, 800);
  },

  async checkLiked({ state, rootState, commit }: Ctx) {
    const id = state.track?.id;
    if (!id) return;
    try {
      const [liked] = await SpotifyService.containsSavedTracks(
        userToken(rootState),
        [id],
      );
      commit("SET_SPOTIFY_LIKED", Boolean(liked));
    } catch {
      commit("SET_SPOTIFY_LIKED", false);
    }
  },

  async toggleSpotifyLiked({ state, rootState, commit, dispatch }: Ctx) {
    const id = state.track?.id;
    if (!id) return;
    const liked = !state.liked;
    commit("SET_SPOTIFY_LIKED", liked);
    const done = await withUserToken(rootState, dispatch, (token) =>
      liked
        ? SpotifyService.saveTracks(token, [id])
        : SpotifyService.removeSavedTracks(token, [id]),
    );
    if (done === undefined) commit("SET_SPOTIFY_LIKED", !liked);
    else
      dispatch(
        "setSuccess",
        liked ? "Added to your Liked Songs" : "Removed from your Liked Songs",
      );
  },

  async addToSpotifyQueue(
    { rootState, dispatch }: Ctx,
    song: { uri?: string; name?: string },
  ) {
    if (!song.uri) return;
    const done = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.addToPlaybackQueue(token, song.uri as string),
    );
    if (done !== undefined) {
      dispatch("setAddToQueueNotifaction", true);
      setTimeout(() => dispatch("setAddToQueueNotifaction", false), 500);
      dispatch("loadSpotifyQueue");
    }
  },

  async loadSpotifyQueue({ rootState, commit, dispatch }: Ctx) {
    const queue = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getQueue(token),
    );
    if (queue)
      commit(
        "SET_SPOTIFY_QUEUE",
        queue.queue.filter(Boolean).map(fromApiTrack),
      );
  },

  async followSpotifyArtist(
    { rootState, dispatch }: Ctx,
    { sid, follow }: { sid: string; follow: boolean },
  ) {
    const done = await withUserToken(rootState, dispatch, (token) =>
      follow
        ? SpotifyService.followArtists(token, [sid])
        : SpotifyService.unfollowArtists(token, [sid]),
    );
    if (done !== undefined)
      dispatch(
        "setSuccess",
        follow ? "Following the artist" : "Unfollowed the artist",
      );
  },

  async isFollowingSpotifyArtist(
    { rootState }: Ctx,
    sid: string,
  ): Promise<boolean> {
    try {
      const [following] = await SpotifyService.isFollowingArtists(
        userToken(rootState),
        [sid],
      );
      return Boolean(following);
    } catch {
      return false;
    }
  },

  /** Adds the playing song to the graph with its album, artists and genres. */
  async addNowPlayingToGraph({ state, rootState, dispatch }: Ctx) {
    const id = state.track?.id;
    if (!id) return;
    const result = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getFullSongData(token, [id]),
    );
    const track = result?.tracks[0];
    if (!track) return;
    await addSongsWithNeighbors(dispatch, [track]);
    dispatch("fitGraphToScreen");
  },

  /** Replaces the graph with the top artists of the user and their genres. */
  async loadTopArtistsGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getTopArtists(token),
    );
    if (!page || page.items.length === 0) {
      dispatch("setInfo", "Spotify has no top artists for you yet");
      return;
    }
    commit("CLEAR_GRAPH");
    dispatch("setMessage", "Loading your top artists");
    const sids = page.items.map((artist) => artist.id);
    // Known artists keep their database id, so their genres can load.
    const dbNodes = await checkNodesExistence(
      "artist",
      sids,
      rootState.schema,
      dispatch,
      rootState,
    ).catch(() => null);
    const nodes: NodeInput[] = page.items.map(
      (artist, index) =>
        dbNodes?.[index] ??
        nodeFromSpotify("artist", artist as unknown as Record<string, unknown>),
    );
    dispatch("addToGraph", { nodes, links: [] });
    await dispatch("expandAction", {
      nodes,
      expandConfiguration: [{ nodeType: "artist", edges: ["Artist_to_Genre"] }],
    });
    dispatch("fitGraphToScreen");
  },

  /** Replaces the graph with the liked songs of the user and their albums, artists and genres. */
  async loadLikedSongsGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getSavedTracks(token),
    );
    if (!page || page.items.length === 0) {
      dispatch("setInfo", "You have no liked songs yet");
      return;
    }
    commit("CLEAR_GRAPH");
    dispatch("setMessage", "Loading your liked songs");
    await addSongsWithNeighbors(
      dispatch,
      page.items.map((item) => item.track),
    );
    dispatch("fitGraphToScreen");
  },

  /** Replaces the graph with the recently played songs of the user. */
  async loadRecentlyPlayedGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getRecentlyPlayed(token),
    );
    if (!page || page.items.length === 0) {
      dispatch("setInfo", "Spotify has no recently played songs for you");
      return;
    }
    commit("CLEAR_GRAPH");
    dispatch("setMessage", "Loading your recently played songs");
    await addSongsWithNeighbors(
      dispatch,
      page.items.map((item) => item.track),
    );
    dispatch("fitGraphToScreen");
  },
} satisfies ActionTree<SpotifyPlayerState, RootState>;

/** The playback fields of the state, to change a few of them in one commit. */
function currentUpdate(state: SpotifyPlayerState): PlaybackUpdate {
  return {
    track: state.track,
    paused: state.paused,
    positionMs: state.positionMs,
    shuffle: state.shuffle,
    repeat: state.repeat,
    isLocal: state.isLocal,
    remoteDeviceName: state.remoteDeviceName,
  };
}

export default actions;
