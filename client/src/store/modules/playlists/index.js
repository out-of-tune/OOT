import actions from "./actions";
import mutations from "./mutations";

export const playlists = {
  state: {
    playlistLoaderOpen: false,
    playlistChooserOpen: false,
    playlists: [],
    currentPlaylist: {},
  },
  actions,
  mutations,
};

export default playlists;
