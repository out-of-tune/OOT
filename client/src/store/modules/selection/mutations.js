const SET_SELECTED_NODES = (state, nodes)=>{
    state.selectedNodes = nodes
}
const SET_SELECTION_MODAL_STATE = (state, open)=>{
    state.modalOpen = open
}
const SET_SELECTED_INDEX = (state, index)=>{
    state.selectedNodeIndex = index
}
const SET_TEMPORARY_SELECTED = (state,nodes)=>{
    state.temporarySelectedNodes = nodes
}

export const mutations = {
    SET_SELECTED_NODES,
    SET_SELECTION_MODAL_STATE,
    SET_SELECTED_INDEX,
    SET_TEMPORARY_SELECTED
}
export default mutations