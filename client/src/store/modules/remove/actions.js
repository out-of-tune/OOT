const deleteGraph = ({
    commit
}) => {
    commit('CLEAR_GRAPH')
}
const deleteNodes = ({
    commit
}, label) => {
    commit('DELETE_NODES_FROM_GRAPH', {
        label: label
    })
}

export const actions = {
    deleteGraph,
    deleteNodes
}

export default actions