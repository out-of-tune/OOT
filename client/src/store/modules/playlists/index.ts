import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import type { SpotifyPlaylist } from "@/types/spotify";
import actions from "./actions";
import mutations from "./mutations";

export interface PlaylistsState {
  playlistLoaderOpen: boolean;
  playlists: SpotifyPlaylist[];
  /** Playlist that "add to playlist" writes to. Empty object when none is chosen. */
  currentPlaylist: Partial<SpotifyPlaylist>;
}

export const playlists: Module<PlaylistsState, RootState> = {
  state: () => ({
    playlistLoaderOpen: false,
    playlists: [],
    currentPlaylist: {},
  }),
  actions,
  mutations,
};

export default playlists;
