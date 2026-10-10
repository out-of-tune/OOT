import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import type { SpotifyPlaylist } from "@/types/spotify";
import actions from "./actions";
import mutations from "./mutations";

export interface PlaylistsState {
  playlistLoaderOpen: boolean;
  playlists: SpotifyPlaylist[];
  /** Number of playlists that Spotify has for the user. `null` before the first load. */
  playlistsTotal: number | null;
  /** Playlist that "add to playlist" writes to. Empty object when none is chosen. */
  currentPlaylist: Partial<SpotifyPlaylist>;
}

export const playlists: Module<PlaylistsState, RootState> = {
  state: () => ({
    playlistLoaderOpen: false,
    playlists: [],
    playlistsTotal: null,
    currentPlaylist: {},
  }),
  actions,
  mutations,
};

export default playlists;
