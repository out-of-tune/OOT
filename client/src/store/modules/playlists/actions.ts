import type { ActionTree, Commit, Dispatch } from "vuex";
import SpotifyService from "@/services/SpotifyService";
import type { GraphItems, NodeInput } from "@/types/graph";
import type { SpotifyPlaylist, SpotifyTrack } from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import type { PlaylistsState } from "./index";
import { nodeFromSpotify } from "@/lib/spotifyNode";
import { statusOf } from "@/lib/token";

type Ctx = Context<PlaylistsState>;

const formatSongList = (songs: { name?: string }[]) =>
  songs.map((song) => `'${song.name ?? ""}'`).join(", ");

const nodesOf = (result: unknown): NodeInput[] =>
  (result as GraphItems | undefined)?.nodes ?? [];

/**
 * Adds song nodes to the graph, then their albums, the artists of those albums and the
 * genres of those artists. Playlists, liked songs and recently played songs use it.
 */
export async function addSongsWithNeighbors(
  dispatch: Dispatch,
  tracks: (SpotifyTrack | null | undefined)[],
) {
  const songNodes: NodeInput[] = tracks
    .filter((track): track is SpotifyTrack => Boolean(track?.id))
    .map((track) => ({
      ...nodeFromSpotify("song", track as unknown as Record<string, unknown>),
      links: [],
    }));

  dispatch("addToGraph", { nodes: songNodes, links: [] });

  const albums = await dispatch("expandAction", {
    nodes: songNodes,
    expandConfiguration: [{ nodeType: "song", edges: ["Song_to_Album"] }],
  });
  const artists = await dispatch("expandAction", {
    nodes: nodesOf(albums).filter((node) => node.data.label === "album"),
    expandConfiguration: [{ nodeType: "album", edges: ["Album_to_Artist"] }],
  });
  await dispatch("expandAction", {
    nodes: nodesOf(artists).filter((node) => node.data.label === "artist"),
    expandConfiguration: [{ nodeType: "artist", edges: ["Artist_to_Genre"] }],
  });
}

/**
 * Replaces the graph with the nodes that `add` builds from `items`. The graph stays when
 * the items could not be loaded (`undefined`) or there are none.
 */
export async function replaceGraphWith<T>(
  { commit, dispatch }: { commit: Commit; dispatch: Dispatch },
  items: T[] | undefined,
  messages: { loading: string; empty: string },
  add: (items: T[]) => Promise<unknown>,
) {
  if (!items) return;
  if (items.length === 0) {
    dispatch("setInfo", messages.empty);
    return;
  }
  commit("CLEAR_GRAPH");
  dispatch("setMessage", messages.loading);
  await add(items);
  dispatch("fitGraphToScreen");
}

export const actions = {
  changePlaylistLoaderState({ commit }: Ctx, modalState: boolean) {
    commit("CHANGE_PLAYLIST_LOADER_STATE", modalState);
  },

  async getCurrentUsersPlaylists({ commit, rootState }: Ctx) {
    const result = await SpotifyService.getCurrentUserPlaylists(
      rootState.authentication.accessToken,
      50,
      0,
    );
    commit("SET_USER_PLAYLISTS", result.items);
  },

  async loadMoreCurrentUsersPlaylists({ commit, rootState }: Ctx) {
    const loaded = rootState.playlists.playlists;
    const result = await SpotifyService.getCurrentUserPlaylists(
      rootState.authentication.accessToken,
      50,
      loaded.length,
    );
    commit("SET_USER_PLAYLISTS", loaded.concat(result.items));
  },

  clearPlaylists({ commit }: Ctx) {
    commit("SET_CURRENT_PLAYLIST", {});
    commit("SET_USER_PLAYLISTS", []);
  },

  setCurrentPlaylist({ commit, dispatch }: Ctx, playlist: SpotifyPlaylist) {
    dispatch("setSuccess", `${playlist.name} selected for editing`);
    commit("SET_CURRENT_PLAYLIST", playlist);
  },

  addSongToPlaylist({ dispatch }: Ctx, song: { uri: string; name?: string }) {
    return dispatch("addSongsToPlaylist", [song]);
  },

  async addSongsToPlaylist(
    { dispatch, rootState, state }: Ctx,
    songs: { uri: string; name?: string }[],
  ) {
    const token = rootState.authentication.accessToken;
    const playlistId = state.currentPlaylist.id;
    if (!token) {
      dispatch("setError", new Error("no token provided"));
      return;
    }
    if (!playlistId) {
      dispatch("setError", new Error("no playlist is chosen"));
      return;
    }
    const songUris = songs.map((song) => song.uri).filter(Boolean);
    if (songUris.length === 0) {
      dispatch("setInfo", "No songs to add");
      return;
    }
    try {
      await SpotifyService.addSongsToPlaylist(token, playlistId, songUris);
      dispatch(
        "setSuccess",
        `Added ${formatSongList(songs)} to ${state.currentPlaylist.name}`,
      );
    } catch (error) {
      dispatch("setError", error);
    }
  },

  /** Replaces the graph with the songs of a playlist, their albums, artists and genres. */
  async loadPlaylist(
    { dispatch, rootState, commit }: Ctx,
    playlist?: SpotifyPlaylist,
  ) {
    if (!playlist?.id) {
      dispatch("setInfo", "Choose a playlist first");
      return;
    }
    let tracks: SpotifyTrack[] | undefined;
    try {
      const result = await SpotifyService.getSongsFromPlaylist(
        rootState.authentication.accessToken,
        playlist.id,
      );
      tracks = result.items.map((item) => item.track);
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The playlist ${playlist.name} could not be loaded (${statusOf(error) ?? "network"})`,
        ),
      );
    }
    await replaceGraphWith(
      { commit, dispatch },
      tracks,
      {
        loading: `loading playlist ${playlist.name}`,
        empty: `The playlist ${playlist.name} has no songs`,
      },
      (songs) => addSongsWithNeighbors(dispatch, songs),
    );
  },
} satisfies ActionTree<PlaylistsState, RootState>;

export default actions;
