
const CHANGE_PLAYLIST_LOADER_STATE = (state, modalState) => {
    state.playlistLoaderOpen = modalState
}
const CHANGE_PLAYLIST_CHOOSER_STATE = (state, modalState) => {
    state.playlistChooserOpen = modalState
}

const SET_USER_PLAYLISTS = (state, playlists) => {
    state.playlists = playlists
}

const SET_CURRENT_PLAYLIST = (state, playlist) => {
    state.currentPlaylist = playlist
}

export const mutations = {
    CHANGE_PLAYLIST_LOADER_STATE,
    SET_USER_PLAYLISTS,
    SET_CURRENT_PLAYLIST,
    CHANGE_PLAYLIST_CHOOSER_STATE
}

export default mutations