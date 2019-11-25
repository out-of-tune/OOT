const SET_STORED_GRAPH_NAMES = (state, graphNames)=>{
    state.storedGraphNames = graphNames
}

const SET_GRAPH_URL = (state, url)=>{
    state.url = url
}

export const mutations = {
    SET_STORED_GRAPH_NAMES,
    SET_GRAPH_URL
}

export default mutations