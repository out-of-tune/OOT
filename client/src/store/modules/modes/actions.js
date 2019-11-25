import _ from "lodash"

const getEdges = selectedOptions => selectedOptions.map(option => option.edgeLabel)

const updateGraphModificationConfiguration = ({
    commit
}, {
    actionType,
    selectedOptions,
    nodeType
}) => {
    const edges = getEdges(selectedOptions)
    const configuration = {nodeType, edges}
    const commitType = actionType === "expand" 
        ? "UPDATE_EXPAND_CONFIGURATION" 
        : "UPDATE_COLLAPSE_CONFIGURATION"
    commit(commitType, configuration)
}


const setActiveMode = ({
    commit
}, activeMode) => {
    commit('SET_ACTIVE_MODE', activeMode)
}


export const actions = {
    setActiveMode,
    updateGraphModificationConfiguration
}

export default actions