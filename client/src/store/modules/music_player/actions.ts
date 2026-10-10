import type { ActionTree, Dispatch } from "vuex";
import { chunk, sample } from "lodash-es";
import { findNodesBySid } from "@/lib/graph";
import { hasSongs, songFromTrack, spotifyImages } from "@/lib/spotifyNode";
import { describeSpotifyError, handleTokenError, statusOf } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { NodeData } from "@/types/graph";
import type { Song, SpotifyTrack } from "@/types/spotify";
import type { Context, NodeRef, RootState } from "@/store/types";
import { addSongsWithNeighbors } from "../playlists/actions";
import type { MusicPlayerState } from "./index";

type Ctx = Context<MusicPlayerState>;

/** How long the "+1" badge shows after a song is queued, in milliseconds. */
const QUEUE_NOTIFICATION_TIME = 500;
/** Nodes whose songs load at the same time. */
const PARALLEL_NODES = 8;
/** Spotify accepts at most 50 ids per batch request. */
const SONG_BATCH_SIZE = 50;

/** The full songs of the Spotify ids, in their order. A song that Spotify does not know is `null`. */
async function fullSongs(
  dispatch: Dispatch,
  rootState: RootState,
  sids: string[],
) {
  const results = await Promise.all(
    chunk(sids, SONG_BATCH_SIZE).map((batch) =>
      handleTokenError(
        (ids: string[], token: string) =>
          SpotifyService.getFullSongData(token, ids),
        [batch],
        dispatch,
        rootState,
      ),
    ),
  );
  return results.flatMap((result) => result.tracks);
}

export async function retrieveFullSongData(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
) {
  const [track] = await fullSongs(dispatch, rootState, [String(node.data.sid)]);
  if (!track) throw new Error("Spotify has no data for this song");
  return { node, data: songFromTrack(track) as Partial<NodeData> };
}

/** The songs of an artist (those that Spotify finds for the artist) or the tracks of an album. */
function songsOf(dispatch: Dispatch, rootState: RootState, node: NodeRef) {
  return handleTokenError(
    (sid: string, token: string): Promise<SpotifyTrack[]> =>
      node.data.label === "artist"
        ? SpotifyService.getSongSamplesFromArtist(
            token,
            sid,
            String(node.data.name ?? ""),
          ).then((data) => data.tracks)
        : SpotifyService.getSongsFromAlbum(token, sid).then(
            (data) => data.items,
          ),
    [String(node.data.sid)],
    dispatch,
    rootState,
  );
}

/** A random song of an artist or of an album node, or `null` when Spotify has none. */
async function randomSongOf(
  dispatch: Dispatch,
  rootState: RootState,
  node: NodeRef,
): Promise<Song | null> {
  const tracks = await songsOf(dispatch, rootState, node);
  const track = sample(tracks.filter((item) => item?.uri));
  return track ? songFromTrack(track, spotifyImages(node.data.images)) : null;
}

/**
 * One song for each node, in the order of the nodes: the song of a song node, a random
 * song of an artist (from the songs that Spotify finds for the artist) or a random song
 * of an album. Other nodes, and nodes that Spotify has no song for, give no song.
 */
export async function songsForNodes(
  dispatch: Dispatch,
  rootState: RootState,
  nodes: NodeRef[],
): Promise<Song[]> {
  const playable = nodes.filter((node) => node.data.sid && hasSongs(node));
  const songSids = playable
    .filter((node) => node.data.label === "song")
    .map((node) => String(node.data.sid));
  const tracks = new Map<string, SpotifyTrack | null>();
  if (songSids.length > 0) {
    const loaded = await fullSongs(dispatch, rootState, songSids);
    songSids.forEach((sid, index) => tracks.set(sid, loaded[index] ?? null));
  }
  const songs: (Song | null)[] = [];
  for (const batch of chunk(playable, PARALLEL_NODES)) {
    songs.push(
      ...(await Promise.all(
        batch.map((node) => {
          if (node.data.label !== "song")
            return randomSongOf(dispatch, rootState, node).catch(() => null);
          const track = tracks.get(String(node.data.sid));
          return track
            ? songFromTrack(track, spotifyImages(node.data.images))
            : null;
        }),
      )),
    );
  }
  return songs.filter((song): song is Song => song !== null);
}

/**
 * The song node of the Spotify id. When the song is not in the graph, adds it with its
 * album, artists and genres. Undefined when Spotify does not know the song.
 */
export async function findOrAddSongNode(
  dispatch: Dispatch,
  rootState: RootState,
  sid: string,
) {
  const [existing] = findNodesBySid(rootState, "song", sid);
  if (existing) return existing;
  const [track] = await fullSongs(dispatch, rootState, [sid]);
  if (!track) return undefined;
  await addSongsWithNeighbors(dispatch, [track]);
  return findNodesBySid(rootState, "song", sid)[0];
}

/** Goes up on each follow. A follow that sees another number was replaced by a newer song. */
let followRun = 0;

export const actions = {
  /** Adds songs of the artist, or the tracks of the album, to the node shown in the info panel. */
  async getSongSamples({ commit, rootState, dispatch }: Ctx, node: NodeRef) {
    try {
      const tracks = await songsOf(dispatch, rootState, node);
      commit("ADD_NODE_DATA", { node, data: { tracks } });
    } catch (error) {
      console.error(error);
    }
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
  addToQueue({ dispatch }: Ctx, song: Song): Promise<number> {
    return dispatch("addSongsToQueue", [song]);
  },

  /** Adds the songs in their order. Returns the number of songs that were queued. */
  async addSongsToQueue(
    { commit, dispatch, rootState }: Ctx,
    songs: Song[],
  ): Promise<number> {
    if (songs.length === 0) return 0;
    if (rootState.spotify_player.status === "ready") {
      const withUri = songs.filter((song) => song.uri);
      const done: boolean = await dispatch("addSongsToSpotifyQueue", withUri);
      return done ? withUri.length : 0;
    }
    dispatch("flashQueueBadge");
    songs.forEach((song) => commit("ADD_TO_QUEUE", song));
    return songs.length;
  },

  /**
   * Adds the songs of nodes to the queue: the song of a song node, a random song of an
   * artist or of an album. The "queue" click mode and the selection use it.
   */
  async addNodesToQueue(
    { dispatch, rootState }: Ctx,
    nodes: NodeRef[],
  ): Promise<number> {
    let songs: Song[];
    try {
      songs = await songsForNodes(dispatch, rootState, nodes);
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The songs could not be loaded (${statusOf(error) ?? "network"})`,
        ),
      );
      return 0;
    }
    if (songs.length === 0) {
      dispatch(
        "setInfo",
        nodes.length === 1
          ? `Spotify has no song for ${nodes[0].data.name ?? "this node"}`
          : "Spotify has no songs for these nodes",
      );
      return 0;
    }
    const queued: number = await dispatch("addSongsToQueue", songs);
    if (queued === 0) return 0;
    dispatch(
      "setSuccess",
      queued === 1
        ? `Added ${songs[0].name} to the queue`
        : `Added ${queued} songs to the queue`,
    );
    return queued;
  },

  setFollowPlayback({ commit, dispatch }: Ctx, follow: boolean) {
    commit("SET_FOLLOW_PLAYBACK", follow);
    if (follow) dispatch("followNowPlaying");
  },

  /**
   * In follow mode, moves the view to the node of the song that plays, shows the node in
   * the info panel, and adds the song to the graph when it is not there.
   */
  async followNowPlaying({ state, rootState, commit, dispatch }: Ctx) {
    if (!state.followPlayback) return;
    const spotify = rootState.spotify_player;
    const sid =
      spotify.status === "ready" ? spotify.track?.id : state.currentSong.id;
    if (!sid) return;
    const run = ++followRun;
    try {
      const node = await findOrAddSongNode(dispatch, rootState, sid);
      if (run !== followRun || !state.followPlayback) return;
      if (!node) {
        dispatch("setInfo", "The song that plays could not be found");
        return;
      }
      commit("SET_CURRENTNODE", node);
      dispatch("setNodeInfoVisibility", true);
      dispatch("moveToNode", node);
      if (!node.data.album) dispatch("loadSongInfo", node);
    } catch (error) {
      console.error(error);
    }
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

  playAtIndexInQueue({ commit, dispatch, state }: Ctx, index: number) {
    if (index >= 0 && index < state.queue.length) {
      commit("SET_CURRENT_SONG", state.queue[index]);
      commit("SET_QUEUE_INDEX", index);
      dispatch("followNowPlaying");
    }
  },

  /** Loads the full track of a clicked song node and runs the configured song action. */
  async songAction({ dispatch, state }: Ctx, node: NodeRef) {
    const data: Partial<NodeData> | undefined = await dispatch(
      "loadSongInfo",
      node,
    );
    if (data) dispatch(state.songAction, data);
  },

  /**
   * Loads the full track of a song node and shows it in the info panel, if the panel
   * still shows the node. Returns the track data, or undefined when it could not load.
   */
  async loadSongInfo(
    { dispatch, rootState, commit }: Ctx,
    node: NodeRef,
  ): Promise<Partial<NodeData> | undefined> {
    try {
      const updated = await retrieveFullSongData(dispatch, rootState, node);
      if (rootState.mainGraph.currentNode.id === node.id)
        commit("ADD_NODE_DATA", updated);
      return updated.data;
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The song could not be loaded (${statusOf(error) ?? "network"})`,
        ),
      );
      return undefined;
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

  /** Shows the "+1" badge of the queue button for a moment. */
  flashQueueBadge({ dispatch }: Ctx) {
    dispatch("setAddToQueueNotifaction", true);
    setTimeout(
      () => dispatch("setAddToQueueNotifaction", false),
      QUEUE_NOTIFICATION_TIME,
    );
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
      await SpotifyService.startPlayback(rootState.authentication.accessToken, {
        uris,
      });
      dispatch("setSuccess", "Playing the queue on Spotify");
    } catch (error) {
      dispatch("setError", new Error(describeSpotifyError(error)));
    }
  },
} satisfies ActionTree<MusicPlayerState, RootState>;

export default actions;
