import type { ActionTree, Dispatch } from "vuex";
import { handleTokenError, statusOf } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { NodeData } from "@/types/graph";
import type { Song, SpotifyTrack } from "@/types/spotify";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { MusicPlayerState } from "./index";

type Ctx = Context<MusicPlayerState>;

/** How long the "+1" badge shows after a song is queued, in milliseconds. */
const QUEUE_NOTIFICATION_TIME = 500;

export async function retrieveFullSongData(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
) {
  const result = await handleTokenError(
    (sids: string[], token: string) =>
      SpotifyService.getFullSongData(token, sids),
    [[String(node.data.sid)]],
    dispatch,
    rootState,
  );
  const track = result.tracks[0];
  if (!track) throw new Error("Spotify has no data for this song");
  return {
    node,
    data: { ...track, images: track.album?.images ?? [] } as Partial<NodeData>,
  };
}

/** Error text from a Spotify API error response. */
const spotifyMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message ??
  (error instanceof Error ? error.message : "Spotify request failed");

export const actions = {
  /** Adds the top tracks (artist) or the tracks (album) to the node shown in the info panel. */
  async getSongSamples({ commit, rootState, dispatch }: Ctx, node: NodeRef) {
    const isArtist = node.data.label === "artist";
    try {
      const [result] = await handleTokenError(
        (sid: string, token: string) => [
          isArtist
            ? SpotifyService.getSongSamplesFromArtist(token, sid).then(
                (data) => data.tracks,
              )
            : SpotifyService.getSongsFromAlbum(token, sid).then(
                (data) => data.items,
              ),
        ],
        [String(node.data.sid)],
        dispatch,
        rootState,
      );
      const tracks: SpotifyTrack[] = result;
      commit("ADD_NODE_DATA", { node, data: { tracks } });
    } catch (error) {
      console.error(error);
    }
  },

  setCurrentSong({ commit }: Ctx, song: Song) {
    commit("SET_CURRENT_SONG", song);
  },

  insertInQueue(
    { commit }: Ctx,
    { song, position }: { song: Song; position: number },
  ) {
    commit("INSERT_IN_QUEUE", { song, position });
  },

  /**
   * Plays the full song with the Spotify player when it is connected. Else inserts the
   * song after the current song and plays its preview.
   */
  playSong({ dispatch, state, rootState }: Ctx, song: Song) {
    if (rootState.spotify_player.status === "ready" && song.uri) {
      return dispatch("spotifyPlay", { uris: [song.uri] });
    }
    const position = state.queue.length === 0 ? 0 : state.queueIndex + 1;
    dispatch("insertInQueue", { song, position });
    dispatch("playAtIndexInQueue", position);
  },

  /** Adds the song to the Spotify queue when the Spotify player is connected, else to the preview queue. */
  addToQueue({ commit, dispatch, rootState }: Ctx, song: Song) {
    if (rootState.spotify_player.status === "ready" && song.uri) {
      return dispatch("addToSpotifyQueue", song);
    }
    dispatch("setAddToQueueNotifaction", true);
    setTimeout(
      () => dispatch("setAddToQueueNotifaction", false),
      QUEUE_NOTIFICATION_TIME,
    );
    commit("ADD_TO_QUEUE", song);
  },

  playNextInQueue({ dispatch, state }: Ctx) {
    if (state.queue.length > state.queueIndex + 1) {
      dispatch("playAtIndexInQueue", state.queueIndex + 1);
    }
  },

  playPreviousInQueue({ dispatch, state }: Ctx) {
    if (state.queueIndex > 0)
      dispatch("playAtIndexInQueue", state.queueIndex - 1);
  },

  playAtIndexInQueue({ commit, state }: Ctx, index: number) {
    if (index >= 0 && index < state.queue.length) {
      commit("SET_CURRENT_SONG", state.queue[index]);
      commit("SET_QUEUE_INDEX", index);
    }
  },

  /** Loads the full track of a clicked song node and runs the configured song action. */
  async songAction({ dispatch, state, rootState, commit }: Ctx, node: NodeRef) {
    try {
      const updatedNode = await retrieveFullSongData(dispatch, rootState, node);
      commit("ADD_NODE_DATA", updatedNode);
      dispatch(state.songAction, updatedNode.data);
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The song could not be loaded (${statusOf(error) ?? "network"})`,
        ),
      );
    }
  },

  removeFromQueue({ commit }: Ctx, queueIndex: number) {
    commit("REMOVE_FROM_QUEUE", queueIndex);
  },

  setQueue(
    { commit }: Ctx,
    { queue, queueIndex }: { queue: Song[]; queueIndex: number },
  ) {
    commit("SET_QUEUE", { queue, queueIndex });
  },

  setQueueVisibility({ commit }: Ctx, visible: boolean) {
    commit("SET_QUEUE_VISIBILITY", visible);
  },

  setNodeInfoVisibility({ commit }: Ctx, visible: boolean) {
    commit("SET_NODEINFO_VISIBILITY", visible);
  },

  setAddToQueueNotifaction({ commit }: Ctx, visible: boolean) {
    commit("SET_ADD_TO_QUEUE_NOTIFICATION_VISIBILITY", visible);
  },

  /** Plays the URIs on the active Spotify device of the user. Needs Spotify Premium. */
  async playOnSpotify({ rootState, dispatch }: Ctx, uris: string[]) {
    if (!rootState.authentication.loginState) {
      dispatch("setInfo", "Log in to Spotify to play the queue there");
      return;
    }
    if (rootState.spotify_player.status === "ready") {
      await dispatch("spotifyPlay", { uris });
      return;
    }
    dispatch("setMessage", "Trying to play queue on Spotify");
    try {
      await SpotifyService.play(rootState.authentication.accessToken, uris);
      dispatch("setSuccess", "Playing the queue on Spotify");
    } catch (error) {
      dispatch("setError", new Error(spotifyMessage(error)));
    }
  },
} satisfies ActionTree<MusicPlayerState, RootState>;

export default actions;
