import type { MutationTree } from "vuex";
import type { SpotifyPlaylist } from "@/types/spotify";
import type { PlaylistsState } from "./index";

export const mutations = {
  CHANGE_PLAYLIST_LOADER_STATE(state, modalState: boolean) {
    state.playlistLoaderOpen = modalState;
  },
  SET_USER_PLAYLISTS(state, playlists: SpotifyPlaylist[]) {
    state.playlists = playlists;
  },
  SET_CURRENT_PLAYLIST(state, playlist: Partial<SpotifyPlaylist>) {
    state.currentPlaylist = playlist;
  },
} satisfies MutationTree<PlaylistsState>;

export default mutations;
