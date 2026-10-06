import type { ActionTree, Dispatch } from "vuex";
import { checkNodesExistence } from "@/lib/graphql";
import { createSpotifyPlayer, type PlayerErrorKind } from "@/lib/spotifyPlayer";
import { nodeFromSpotify } from "@/lib/spotifyNode";
import { sleep } from "@/lib/sleep";
import { describeSpotifyError, statusOf } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { NodeInput } from "@/types/graph";
import type {
  RepeatState,
  Song,
  SpotifyTrack,
  StartPlaybackOptions,
} from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import { addSongsWithNeighbors, findOrAddSongNode } from "@/lib/songs";
import { replaceGraphWith } from "../playlists/actions";
import {
  playbackPosition,
  type NowPlaying,
  type SpotifyPlayerState,
} from "./index";
import type { PlaybackUpdate } from "./mutations";

type Ctx = Context<SpotifyPlayerState>;

/** How often the state of another device is read, in milliseconds. */
const REMOTE_POLL_INTERVAL = 5000;
const REPEAT_ORDER: RepeatState[] = ["off", "context", "track"];
/** Wait before a queue change goes to Spotify, so that quick changes restart the song only once. */
const QUEUE_SYNC_DELAY = 300;
/** Wait before the queue loads again after a change. Spotify shows a change only after a moment. */
const QUEUE_RELOAD_DELAY = 800;

// The SDK player and the poll timer are not state: they must not become reactive or persisted.
let player: SpotifySdkPlayer | null = null;
let pollTimer: ReturnType<typeof setInterval> | undefined;
/** Goes up on each connect and each disconnect. A connect that sees another number was cancelled. */
let connection = 0;
/** The queue change that runs. A change made meanwhile sets `queueDirty`, and the run sends it too. */
let queueSync: Promise<boolean> | null = null;
let queueDirty = false;
let queueReloadTimer: ReturnType<typeof setTimeout> | undefined;

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

/** A queue entry for a song of the graph or of the node info. */
export function fromSong(song: Song): NowPlaying {
  return {
    ...fromApiTrack(song as unknown as SpotifyTrack),
    images:
      (song.album as SpotifyTrack["album"] | undefined)?.images ?? song.images,
  };
}

/** The device that a play request goes to: this tab, unless another device plays. */
const targetDevice = (state: SpotifyPlayerState) =>
  state.remoteDeviceName ? undefined : (state.deviceId ?? undefined);

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
        dispatch("setError", new Error(describeSpotifyError(retryError)));
        return undefined;
      }
    }
    dispatch("setError", new Error(describeSpotifyError(error)));
    return undefined;
  }
}

function stopPolling() {
  if (pollTimer !== undefined) clearInterval(pollTimer);
  pollTimer = undefined;
}

/** Stops the SDK player and cancels a connect that still runs. */
function dropPlayer() {
  stopPolling();
  clearTimeout(queueReloadTimer);
  player?.disconnect();
  player = null;
  connection += 1;
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
    const attempt = ++connection;
    const current = () => attempt === connection;
    const onError = (kind: PlayerErrorKind, message: string) => {
      if (!current()) return;
      if (kind === "account")
        commit("SET_SPOTIFY_PLAYER_STATUS", "premium_required");
      else if (kind === "initialization")
        commit("SET_SPOTIFY_PLAYER_STATUS", "unavailable");
      else if (kind === "authentication") {
        dispatch("refreshToken").catch(() => undefined);
        // The SDK does not retry a failed login, so this connect never becomes ready.
        if (state.status === "connecting") {
          dropPlayer();
          commit("SET_SPOTIFY_PLAYER_STATUS", "unavailable");
          dispatch(
            "setError",
            new Error("Spotify did not accept the login of the player"),
          );
        }
      } else if (kind === "autoplay")
        dispatch("setInfo", "Press play to start the music");
      else dispatch("setError", new Error(`Spotify: ${message}`));
    };
    try {
      const created = await createSpotifyPlayer(
        () => userToken(rootState),
        {
          onReady: (deviceId) => {
            if (!current()) return;
            commit("SET_SPOTIFY_DEVICE_ID", deviceId);
            commit("SET_SPOTIFY_PLAYER_STATUS", "ready");
            dispatch("startRemotePolling");
          },
          onNotReady: () => {
            if (current()) commit("SET_SPOTIFY_DEVICE_ID", null);
          },
          onState: (sdkState) => {
            if (current()) dispatch("applySdkState", sdkState);
          },
          onError,
        },
        state.volume / 100,
      );
      if (current()) player = created;
      else created.disconnect();
    } catch (error) {
      if (!current()) return;
      console.error(error);
      commit("SET_SPOTIFY_PLAYER_STATUS", "unavailable");
    }
  },

  disconnectSpotifyPlayer({ commit }: Ctx) {
    dropPlayer();
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
    if (trackChanged) {
      dispatch("checkLiked");
      dispatch("followNowPlaying");
    }
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
    // 204: no device plays. The next play then goes to this tab again.
    if (!playback) {
      if (!state.isLocal)
        commit("SET_SPOTIFY_PLAYBACK", {
          ...currentUpdate(state),
          paused: true,
          remoteDeviceName: null,
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
    if (trackChanged) {
      dispatch("checkLiked");
      dispatch("followNowPlaying");
    }
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
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.startPlayback(token, {
        ...options,
        deviceId: targetDevice(state),
      }),
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
      const [liked] = await SpotifyService.libraryContains(
        userToken(rootState),
        [`spotify:track:${id}`],
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
    const uris = [`spotify:track:${id}`];
    const done = await withUserToken(rootState, dispatch, (token) =>
      liked
        ? SpotifyService.saveToLibrary(token, uris)
        : SpotifyService.removeFromLibrary(token, uris),
    );
    if (done === undefined) commit("SET_SPOTIFY_LIKED", !liked);
    else
      dispatch(
        "setSuccess",
        liked ? "Added to your Liked Songs" : "Removed from your Liked Songs",
      );
  },

  /**
   * Adds songs to the end of the queue. While a song is loaded, the queue is sent as a
   * whole (see setSpotifyQueue), so that it can be changed later. Returns false when
   * Spotify did not queue the songs.
   */
  async addSongsToSpotifyQueue(
    { state, rootState, commit, dispatch }: Ctx,
    songs: Song[],
  ): Promise<boolean> {
    const added = songs.filter((song) => song.uri);
    if (added.length === 0) return false;
    const queue = [...state.queue, ...added.map(fromSong)];
    let done = true;
    if (state.track) done = await dispatch("setSpotifyQueue", queue);
    else {
      // Nothing is loaded, so there is no song to keep: the Spotify queue takes the songs.
      for (const song of added)
        done =
          (await withUserToken(rootState, dispatch, (token) =>
            SpotifyService.addToPlaybackQueue(token, song.uri as string),
          )) !== undefined && done;
      commit("SET_SPOTIFY_QUEUE", queue);
      scheduleQueueReload(dispatch);
    }
    if (done) dispatch("flashQueueBadge");
    return done;
  },

  /**
   * Replaces the songs up next: removes, reorders, clears or adds songs. The Web API cannot
   * change the queue of Spotify, so this plays the song that plays now again, at its
   * position, followed by the new list. The list shows at once, and goes to Spotify after
   * a short wait. Returns false when Spotify refused it.
   */
  setSpotifyQueue(
    { commit, dispatch }: Ctx,
    queue: NowPlaying[],
  ): Promise<boolean> {
    commit("SET_SPOTIFY_QUEUE", queue);
    return dispatch("syncSpotifyQueue");
  },

  removeFromSpotifyQueue({ state, dispatch }: Ctx, index: number) {
    return dispatch(
      "setSpotifyQueue",
      state.queue.filter((_, position) => position !== index),
    );
  },

  /** Sends the queue of the state to Spotify. Changes made while it runs go in one more request. */
  syncSpotifyQueue({ state, rootState, commit, dispatch }: Ctx) {
    queueDirty = true;
    if (queueSync) return queueSync;
    const run = async () => {
      let done = true;
      try {
        await sleep(QUEUE_SYNC_DELAY);
        while (queueDirty) {
          queueDirty = false;
          done = await replaceUpNext({ state, rootState, commit, dispatch });
        }
      } finally {
        queueSync = null;
      }
      scheduleQueueReload(dispatch);
      return done;
    };
    queueSync = run();
    return queueSync;
  },

  async loadSpotifyQueue({ rootState, commit, dispatch }: Ctx) {
    const queue = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getQueue(token),
    );
    // A change that is not at Spotify yet must not be replaced by the old queue.
    if (queue && !queueSync)
      commit(
        "SET_SPOTIFY_QUEUE",
        queue.queue.filter(Boolean).map(fromApiTrack),
      );
  },

  /** Returns false when Spotify did not change the follow. */
  async followSpotifyArtist(
    { rootState, dispatch }: Ctx,
    { sid, follow }: { sid: string; follow: boolean },
  ): Promise<boolean> {
    const uris = [`spotify:artist:${sid}`];
    const done = await withUserToken(rootState, dispatch, (token) =>
      follow
        ? SpotifyService.saveToLibrary(token, uris)
        : SpotifyService.removeFromLibrary(token, uris),
    );
    if (done === undefined) return false;
    dispatch(
      "setSuccess",
      follow ? "Following the artist" : "Unfollowed the artist",
    );
    return true;
  },

  async isFollowingSpotifyArtist(
    { rootState }: Ctx,
    sid: string,
  ): Promise<boolean> {
    try {
      const [following] = await SpotifyService.libraryContains(
        userToken(rootState),
        [`spotify:artist:${sid}`],
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
    try {
      if (await findOrAddSongNode(dispatch, rootState, id))
        dispatch("fitGraphToScreen");
    } catch (error) {
      dispatch("setError", new Error(describeSpotifyError(error)));
    }
  },

  /** Replaces the graph with the top artists of the user and their genres. */
  async loadTopArtistsGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getTopArtists(token),
    );
    await replaceGraphWith(
      { commit, dispatch },
      page?.items,
      {
        loading: "Loading your top artists",
        empty: "Spotify has no top artists for you yet",
      },
      async (artists) => {
        // Known artists keep their database id, so their genres can load.
        const dbNodes = await checkNodesExistence(
          "artist",
          artists.map((artist) => artist.id),
          rootState.schema,
          dispatch,
          rootState,
        ).catch(() => null);
        const nodes: NodeInput[] = artists.map(
          (artist, index) =>
            dbNodes?.[index] ??
            nodeFromSpotify(
              "artist",
              artist as unknown as Record<string, unknown>,
            ),
        );
        dispatch("addToGraph", { nodes, links: [] });
        await dispatch("expandAction", {
          nodes,
          expandConfiguration: [
            { nodeType: "artist", edges: ["Artist_to_Genre"] },
          ],
        });
      },
    );
  },

  /** Replaces the graph with the liked songs of the user and their albums, artists and genres. */
  async loadLikedSongsGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getSavedTracks(token),
    );
    await replaceGraphWith(
      { commit, dispatch },
      page?.items.map((item) => item.track),
      {
        loading: "Loading your liked songs",
        empty: "You have no liked songs yet",
      },
      (tracks) => addSongsWithNeighbors(dispatch, tracks),
    );
  },

  /** Replaces the graph with the recently played songs of the user. */
  async loadRecentlyPlayedGraph({ rootState, commit, dispatch }: Ctx) {
    const page = await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.getRecentlyPlayed(token),
    );
    await replaceGraphWith(
      { commit, dispatch },
      page?.items.map((item) => item.track),
      {
        loading: "Loading your recently played songs",
        empty: "Spotify has no recently played songs for you",
      },
      (tracks) => addSongsWithNeighbors(dispatch, tracks),
    );
  },
} satisfies ActionTree<SpotifyPlayerState, RootState>;

/** Loads the queue after a change, once Spotify shows it. A newer change moves the load on. */
function scheduleQueueReload(dispatch: Dispatch) {
  clearTimeout(queueReloadTimer);
  queueReloadTimer = setTimeout(
    () => dispatch("loadSpotifyQueue"),
    QUEUE_RELOAD_DELAY,
  );
}

/**
 * Plays the song that plays now again, at its position, followed by the queue of the state.
 * Shuffle would mix the new order, so it goes off. A paused song stays paused.
 */
async function replaceUpNext({
  state,
  rootState,
  commit,
  dispatch,
}: Pick<Ctx, "state" | "rootState" | "commit" | "dispatch">) {
  const uris = state.queue.map((song) => song.uri);
  const track = state.track;
  if (!track) {
    if (uris.length === 0) return true;
    return (
      (await withUserToken(rootState, dispatch, (token) =>
        SpotifyService.startPlayback(token, {
          deviceId: targetDevice(state),
          uris,
        }),
      )) !== undefined
    );
  }
  const paused = state.paused;
  if (state.shuffle) {
    commit("SET_SPOTIFY_SHUFFLE", false);
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.setShuffle(token, false),
    );
    dispatch("setInfo", "Shuffle is off, so the queue keeps your order");
  }
  await player?.activateElement().catch(() => undefined);
  const done = await withUserToken(rootState, dispatch, (token) =>
    SpotifyService.startPlayback(token, {
      deviceId: targetDevice(state),
      uris: [track.uri, ...uris],
      positionMs: Math.round(playbackPosition(state)),
    }),
  );
  if (done === undefined) return false;
  if (paused)
    await withUserToken(rootState, dispatch, (token) =>
      SpotifyService.pausePlayback(token),
    );
  return true;
}

/** The playback fields of the state, to change a few of them in one commit. */
function currentUpdate(state: SpotifyPlayerState): PlaybackUpdate {
  return {
    track: state.track,
    paused: state.paused,
    positionMs: playbackPosition(state),
    shuffle: state.shuffle,
    repeat: state.repeat,
    isLocal: state.isLocal,
    remoteDeviceName: state.remoteDeviceName,
  };
}

export default actions;
