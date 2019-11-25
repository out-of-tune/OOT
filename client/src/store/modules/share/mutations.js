const SET_SHARE_MODAL_STATE = (state, modalState) => {
    state.shareModalOpen = modalState
}
const SET_SHARE_LINK = (state, link) => {
    state.shareLink = link
}

export const mutations = {
    SET_SHARE_MODAL_STATE,
    SET_SHARE_LINK
}

export default mutations