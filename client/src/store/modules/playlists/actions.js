import SpotifyService from '@/store/services/SpotifyService'

const changePlaylistLoaderState = ({ commit }, modalState) => {
  commit('CHANGE_PLAYLIST_LOADER_STATE', modalState)
}

const changePlaylistChooserState = ({ commit }, modalState) => {
  commit('CHANGE_PLAYLIST_CHOOSER_STATE', modalState)
}
const getCurrentUsersPlaylists = async ({ commit, rootState }) => {
  const result = await SpotifyService.getCurrentUserPlaylists(
    rootState.authentication.accessToken
  )
  commit('SET_USER_PLAYLISTS', result.items)
}

const clearPlaylists = ({ commit }) => {
  commit("SET_CURRENT_PLAYLIST", {})
  commit("SET_USER_PLAYLISTS", [])
}

const setCurrentPlaylist = ({ commit }, playlist) => {
  commit('SET_CURRENT_PLAYLIST', playlist)
}

const addSongToPlaylist = async ({ dispatch }, songUri) => {
  dispatch('addSongsToPlaylist', [songUri])
}

const addSongsToPlaylist = async ({ dispatch, rootState, state }, songUris) => {
  const token = rootState.authentication.accessToken
  const playlistId = state.currentPlaylist.id
  if (token) {
    if (playlistId) {
      await SpotifyService.addSongsToPlaylist(token, playlistId, songUris)
      dispatch('setMessage', ("Added " + (songUris.length == 1 ? "song" : songUris.length + " songs") + " to " + state.currentPlaylist.name))
    }
    else {
      dispatch('setError', new Error("no playlist is chosen"))
    }
  }
  else {
    dispatch('setError', new Error("no token provided"))
  }
}

const addSongToSpotifyQueue = async ({ dispatch, rootState }, songUri) => {
  const token = rootState.authentication.accessToken
  if (token) {
    try {
      await SpotifyService.addSongToQueue(token, songUri)
    }
    catch(e){
      dispatch('setError', e.response.data.error)
      return
    }
    dispatch('setSuccess', "Added song to Spotify Queue")
  }
  else {
    dispatch('setError', new Error("no token provided"))
  }
}

const loadPlaylist = async ({ dispatch, rootState, commit }, playlistId) => {

  //it is currently necessary to clear the graph because the history is used and the history stores only new nodes
  //which means that if a "playlist node" was already in the graph it will not be expanded properly
  commit('CLEAR_GRAPH')

  //get songs
  const result = await SpotifyService.getSongsFromPlaylist(
    rootState.authentication.accessToken, playlistId
  )
  const songNodes = result.items.map(item => {
    const { id, ...data } = item.track
    return { id: "Song/" + id, data: { sid: id, ...data, label: "song" }, links: [] }
  })

  dispatch('addToGraph', { nodes: songNodes, links: [] })

  await dispatch('expandAction', { nodes: songNodes, expandConfiguration: [{ nodeType: "song", edges: ["Song_to_Album"] }] })
  const albumNodes = rootState.history.changes[rootState.history.historyIndex].data.nodes
  await dispatch('expandAction', { nodes: albumNodes, expandConfiguration: [{ nodeType: "album", edges: ["Album_to_Artist"] }] })
  const artistNodes = rootState.history.changes[rootState.history.historyIndex].data.nodes
  dispatch('expandAction', { nodes: artistNodes, expandConfiguration: [{ nodeType: "artist", edges: ["Artist_to_Genre"] }] })

}

export const actions = {
  changePlaylistLoaderState,
  changePlaylistChooserState,
  getCurrentUsersPlaylists,
  setCurrentPlaylist,
  addSongToPlaylist,
  addSongToSpotifyQueue,
  addSongsToPlaylist,
  loadPlaylist,
  clearPlaylists
}

export default actions
