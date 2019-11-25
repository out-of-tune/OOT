const SET_NODE_LABELS = (state,nodeLabels)=>{
    state.nodeLabels = nodeLabels
}
const ADD_NODE_LABEL = (state,nodeLabel)=>{
    state.nodeLabels[nodeLabel.id] = nodeLabel
}
const REMOVE_NODE_LABEL = (state,nodeLabel)=>{
    const {[nodeLabel.id]:id, ...restlabels} = state.nodeLabels
    state.nodeLabels = restlabels
}
export const mutations = {
    SET_NODE_LABELS,
    ADD_NODE_LABEL,
    REMOVE_NODE_LABEL
}
export default mutations