import type { ActionTree, Commit, Dispatch } from "vuex";
import { uniqBy } from "lodash-es";
import SpotifyService from "@/services/SpotifyService";
import type { SpotifyPlaylist, SpotifyTrack } from "@/types/spotify";
import type { Context, RootState } from "@/store/types";
import type { PlaylistsState } from "./index";
import { getAllNodes } from "@/lib/graph";
import { hasSongs } from "@/lib/spotifyNode";
import { addSongsWithNeighbors, songsForNodes } from "@/lib/songs";
import { statusOf } from "@/lib/token";

type Ctx = Context<PlaylistsState>;

/** Most artist and album nodes that "save graph as playlist" takes. */
export const GRAPH_PLAYLIST_LIMIT = 100;
/** Spotify returns at most 50 playlists per page. */
const PLAYLIST_PAGE_SIZE = 50;
/** Goes up on each load of the first page. A page from an older load is dropped. */
let playlistLoad = 0;

const formatSongList = (songs: { name?: string }[]) =>
  songs.map((song) => `'${song.name ?? ""}'`).join(", ");

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

  /**
   * Loads the first page of playlists again. Spotify is the source of truth: playlists that
   * another Spotify app created, renamed or deleted show here after the next load.
   */
  async getCurrentUsersPlaylists({ commit, rootState, state }: Ctx) {
    const load = ++playlistLoad;
    const result = await SpotifyService.getCurrentUserPlaylists(
      rootState.authentication.accessToken,
      PLAYLIST_PAGE_SIZE,
      0,
    );
    if (load !== playlistLoad) return;
    commit("SET_USER_PLAYLISTS", result.items);
    commit("SET_PLAYLISTS_TOTAL", result.total ?? null);
    const current = result.items.find(
      (playlist) => playlist.id === state.currentPlaylist.id,
    );
    if (current) commit("SET_CURRENT_PLAYLIST", current);
  },

  /** Loads the next page of playlists. Does nothing when all are loaded. */
  async loadMoreCurrentUsersPlaylists({ commit, rootState, state }: Ctx) {
    const loaded = state.playlists;
    if (state.playlistsTotal !== null && loaded.length >= state.playlistsTotal)
      return;
    const load = playlistLoad;
    const result = await SpotifyService.getCurrentUserPlaylists(
      rootState.authentication.accessToken,
      PLAYLIST_PAGE_SIZE,
      loaded.length,
    );
    // A new first page replaced the list while this page loaded.
    if (load !== playlistLoad) return;
    // A playlist created elsewhere moves the pages, so a page can repeat a playlist.
    const playlists = uniqBy(loaded.concat(result.items), "id");
    commit("SET_USER_PLAYLISTS", playlists);
    commit(
      "SET_PLAYLISTS_TOTAL",
      result.next === null
        ? playlists.length
        : (result.total ?? state.playlistsTotal),
    );
  },

  /** Creates a private playlist with the songs, in their order. Returns the playlist, or undefined. */
  async createPlaylist(
    { commit, dispatch, rootState, state }: Ctx,
    { name, uris = [] }: { name: string; uris?: string[] },
  ): Promise<SpotifyPlaylist | undefined> {
    const token = rootState.authentication.accessToken;
    const trimmed = name.trim();
    if (!rootState.authentication.loginState || !token) {
      dispatch("setInfo", "Log in to Spotify to create playlists");
      return undefined;
    }
    if (!trimmed) {
      dispatch("setInfo", "Give the playlist a name");
      return undefined;
    }
    try {
      const playlist = await SpotifyService.createPlaylist(token, trimmed, {
        description: "Made with out-of-tune",
      });
      if (uris.length > 0)
        await SpotifyService.addSongsToPlaylist(token, playlist.id, uris);
      commit("SET_USER_PLAYLISTS", [playlist, ...state.playlists]);
      if (state.playlistsTotal !== null)
        commit("SET_PLAYLISTS_TOTAL", state.playlistsTotal + 1);
      dispatch(
        "setSuccess",
        uris.length > 0
          ? `Saved ${uris.length} songs as ${playlist.name}`
          : `Created ${playlist.name}`,
      );
      return playlist;
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The playlist could not be created (${statusOf(error) ?? "network"})`,
        ),
      );
      return undefined;
    }
  },

  /**
   * Creates a playlist from the graph: its songs, and a random song of each artist and
   * album. Each artist and album costs one Spotify request, so a graph with more than
   * GRAPH_PLAYLIST_LIMIT of them needs a selection instead. Songs load 50 per request.
   */
  async saveGraphAsPlaylist(
    { dispatch, rootState }: Ctx,
    name: string,
  ): Promise<SpotifyPlaylist | undefined> {
    const nodes = getAllNodes(rootState).filter(hasSongs);
    if (nodes.length === 0) {
      dispatch("setInfo", "The graph has no songs, artists or albums");
      return undefined;
    }
    const costly = nodes.filter((node) => node.data.label !== "song").length;
    if (costly > GRAPH_PLAYLIST_LIMIT) {
      dispatch(
        "setInfo",
        `The graph has ${costly} artists and albums. Select up to ${GRAPH_PLAYLIST_LIMIT} and use "Add to playlist".`,
      );
      return undefined;
    }
    dispatch("setMessage", "Picking the songs of the graph");
    let songs: { uri?: string }[];
    try {
      songs = await songsForNodes(dispatch, rootState, nodes);
    } catch (error) {
      dispatch(
        "setError",
        new Error(
          `The songs could not be loaded (${statusOf(error) ?? "network"})`,
        ),
      );
      return undefined;
    }
    const uris = songs
      .map((song) => song.uri)
      .filter((uri): uri is string => Boolean(uri));
    return dispatch("createPlaylist", { name, uris });
  },

  /** Opens the playlist window, so that the user chooses the playlist that songs go to. */
  choosePlaylist({ dispatch }: Ctx) {
    dispatch("setInfo", "Choose the playlist that songs go to");
    dispatch("changePlaylistLoaderState", true);
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
      dispatch("choosePlaylist");
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
