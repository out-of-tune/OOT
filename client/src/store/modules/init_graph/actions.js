const setGraphContainer = ({
    commit
}, graphContainer) => {
    commit('SET_GRAPHCONTAINER', graphContainer)
}
const initGraph = ({
    commit,
    dispatch
}) => {
    commit('CREATE_GRAPH')
    commit('SET_RENDERER')
    dispatch('initEvents')
    commit('START_RENDERER')
    dispatch('generateInceptionGraph')
}

export const actions = {
    setGraphContainer,
    initGraph
}

export default actions