import SpotifyService from "@/store/services/SpotifyService";

const changePlaylistLoaderState = ({ commit }, modalState) => {
  commit("CHANGE_PLAYLIST_LOADER_STATE", modalState);
};

const changePlaylistChooserState = ({ commit }, modalState) => {
  commit("CHANGE_PLAYLIST_CHOOSER_STATE", modalState);
};
const getCurrentUsersPlaylists = async ({ commit, rootState }) => {
  const result = await SpotifyService.getCurrentUserPlaylists(
    rootState.authentication.accessToken,
    50,
    0,
  );
  commit("SET_USER_PLAYLISTS", result.items);
};

const loadMoreCurrentUsersPlaylists = async ({ commit, rootState }) => {
  console.log(rootState.playlists.playlists.length);
  const result = await SpotifyService.getCurrentUserPlaylists(
    rootState.authentication.accessToken,
    50,
    rootState.playlists.playlists.length,
  );
  const playlists = rootState.playlists.playlists.concat(result.items);
  commit("SET_USER_PLAYLISTS", playlists);
};

const clearPlaylists = ({ commit }) => {
  commit("SET_CURRENT_PLAYLIST", {});
  commit("SET_USER_PLAYLISTS", []);
};

const setCurrentPlaylist = ({ commit, dispatch }, playlist) => {
  dispatch("setSuccess", playlist.name + " selected for editing");
  commit("SET_CURRENT_PLAYLIST", playlist);
};

const addSongToPlaylist = async ({ dispatch }, song) => {
  dispatch("addSongsToPlaylist", [song]);
};

const printSongList = (songs) => {
  console.log(songs);
  const str = songs.reduce((previous, current, index) => {
    if (index === songs.length - 1) {
      return previous + "'" + current.name + "'";
    }
    return previous + "''" + current.name + "' , ";
  }, "");
  return str;
};

const addSongsToPlaylist = async ({ dispatch, rootState, state }, songs) => {
  const token = rootState.authentication.accessToken;
  const playlistId = state.currentPlaylist.id;
  console.log(songs);
  const songUris = songs.map((song) => song.uri);
  if (token) {
    if (playlistId) {
      await SpotifyService.addSongsToPlaylist(token, playlistId, songUris);
      dispatch(
        "setSuccess",
        "Added " + printSongList(songs) + " to " + state.currentPlaylist.name,
      );
    } else {
      dispatch("setError", new Error("no playlist is chosen"));
    }
  } else {
    dispatch("setError", new Error("no token provided"));
  }
};

const loadPlaylist = async ({ dispatch, rootState, commit }, playlist) => {
  // it is currently necessary to clear the graph because the history is used and the history stores only new nodes
  // which means that if a "playlist node" was already in the graph it will not be expanded properly
  //
  const playlistId = playlist.id;
  commit("CLEAR_GRAPH");
  dispatch("setMessage", "loading playlist " + playlist.name);

  // get songs
  const result = await SpotifyService.getSongsFromPlaylist(
    rootState.authentication.accessToken,
    playlistId,
  );
  const songNodes = result.items.map((item) => {
    const { id, ...data } = item.track;
    return {
      id: "Song/" + id,
      data: { sid: id, ...data, label: "song" },
      links: [],
    };
  });

  dispatch("addToGraph", { nodes: songNodes, links: [] });

  await dispatch("expandAction", {
    nodes: songNodes,
    expandConfiguration: [{ nodeType: "song", edges: ["Song_to_Album"] }],
  });
  const albumNodes =
    rootState.history.changes[rootState.history.historyIndex].data.nodes;
  await dispatch("expandAction", {
    nodes: albumNodes,
    expandConfiguration: [{ nodeType: "album", edges: ["Album_to_Artist"] }],
  });
  const artistNodes =
    rootState.history.changes[rootState.history.historyIndex].data.nodes;
  dispatch("expandAction", {
    nodes: artistNodes,
    expandConfiguration: [{ nodeType: "artist", edges: ["Artist_to_Genre"] }],
  });
};

export const actions = {
  changePlaylistLoaderState,
  changePlaylistChooserState,
  getCurrentUsersPlaylists,
  setCurrentPlaylist,
  addSongToPlaylist,
  addSongsToPlaylist,
  loadPlaylist,
  clearPlaylists,
  loadMoreCurrentUsersPlaylists,
};

export default actions;
