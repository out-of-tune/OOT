import { getAllNodes, getAllLinks, getNodeColor, getLinkColor } from '@/assets/js/graphHelper'

const clusterNodes = ({
    rootState,
    commit
}) => {
    var createWhisper = require("ngraph.cw");
    var whisper = createWhisper(rootState.mainGraph.Graph);
    // The algorithm is iterative. We should continue running it until change
    // rate within clusters is large:

    var requiredChangeRate = 0; // 0 is complete convergence
    while (whisper.getChangeRate() > requiredChangeRate) {
        whisper.step();
    }
    var clusters = whisper.createClusterMap();
    clusters.forEach(visitCluster);

    function visitCluster(clusterNodes, clusterClass) {
        const getRandomNumber = (low, high) => {
            var r = Math.floor(Math.random() * (high - low + 1)) + low
            return r
        }
        const getHexColorString = () => {
            return getRandomNumber(0x000000, 0xffffff)
                .toString(16) + "ff"
        }
        let color = parseInt(getHexColorString(), 16)
        clusterNodes.forEach((node) => {
            commit("SET_NODE_COLOR", {
                node: node,
                color: color
            })
        })
    }
}
const toggleEdgeVisibility = ({
    rootState,
    commit
}) => {
    if (!rootState.mainGraph.displayState.displayEdges) {
        commit("SHOW_EDGES")
    } else {
        commit("HIDE_EDGES")
    }
}
const switchRendering = ({
    rootState,
    commit
}) => {
    if (rootState.mainGraph.renderState.isRendered) {
        commit("PAUSE_RENDERING")
    } else {
        commit("RESUME_RENDERING")
    }
}
const rerenderGraph =({commit}) =>{
    commit("RERENDER_GRAPH")
}
const addPendingRequest = ({state, commit}) => {
    commit("SET_PENDING_REQUEST_COUNT",++state.pendingRequestCount)
}
const removePendingRequest = ({state, commit}) => {
    commit("SET_PENDING_REQUEST_COUNT",--state.pendingRequestCount)
}
const storeColors = ({ commit, rootState }) => {
    const nodes = getAllNodes(rootState)
    const links = getAllLinks(rootState)

    const colors = {
        nodes: nodes.map(node=>({ node, color: getNodeColor(rootState, node) })),
        links: links.map(link=>({ link, color: getLinkColor(rootState, link) }))
    }
    commit('SET_COLORS', colors)
}
const loadColors = ({ state, commit, dispatch }) => {
    state.colors.nodes.forEach(item=>{
        commit('SET_NODE_COLOR', { node: item.node.id, color: item.color  })
    })
    state.colors.links.forEach(item=>{
        commit('SET_EDGE_COLOR', { link: item.link, color: item.color  })
    })
    dispatch('rerenderGraph')
}

const highlight = ({ rootState, commit, dispatch }, node) => {
    const nodeIds = node.links ? [node.id, ...node.links.map(link=>link.fromId===node.id?link.toId:link.fromId)] : [node.id]
    const linkIds = node.links ? node.links.map(link=>link.id) : []

    const nodes = getAllNodes(rootState).filter(node=>!nodeIds.includes(node.id))
    const links = getAllLinks(rootState).filter(link=>!linkIds.includes(link.id))

    links.forEach(link=>{
        commit('SET_EDGE_COLOR', { link, color: parseInt("77777733", 16) })
    })
    nodes.forEach(node=>{
        commit('SET_NODE_COLOR', { node: node.id, color: parseInt("77777733", 16) })
    })
    nodeIds.forEach(nodeId=>{
        dispatch("setNodeOpacity", { node: {id: nodeId}, opacity: "ff" })
    })
    linkIds.forEach(linkId=>{
        dispatch("setLinkOpacity", { link: {id: linkId}, opacity: "ff" })
    })
    dispatch('rerenderGraph')
}

const toggleHighlight = ({ state, commit }) => {
    commit("SET_HIGHLIGHT_ACTIVE", !state.highlight)
}

const clusterLoop = ({ dispatch, rootState }) => {
    dispatch('storeColors')
    const nodes = getAllNodes(rootState)
    const links = getAllLinks(rootState)
    function setColors(nodes, links, index, time){
        if(index>0){
            dispatch('clusterNodes')
            dispatch('rerenderGraph')
            setTimeout(()=>setColors(nodes, links, index-1, time), time)
        }
        else {
            dispatch('loadColors')
            dispatch('rerenderGraph')
        }
    }
    setColors(nodes, links, 50, 30)
}

const fadeOut = ({ dispatch, commit, rootState }) => {
    const nodes = getAllNodes(rootState)
    const links = getAllLinks(rootState)

    function setOneByOneNode(nodes, color, time, index=nodes.length-1){
        setTimeout(()=>{
            const node = nodes[index]
            //commit('SET_NODE_COLOR', { node: node.id, color})
            commit('REMOVE_NODE', node)
            dispatch('rerenderGraph')
            if(index>0){
                setOneByOneNode(nodes, color, time, index-1)
            }
        }, time)
    }
    setOneByOneNode(nodes, parseInt("77777733", 16), 3)

    function setOneByOneLink(links, color, time, index=links.length-1){
        setTimeout(()=>{
            const link = links[index]
            commit('SET_EDGE_COLOR', { link, color })
            dispatch('rerenderGraph')
            if(index>0){
                setOneByOneLink(links, color, time, index-1,)
            }
        }, time)
    }
    //setOneByOneLink(links, parseInt("77777733", 16), 3)
}

export const actions = {
    clusterNodes,
    toggleEdgeVisibility,
    switchRendering,
    rerenderGraph,
    addPendingRequest,
    removePendingRequest,
    storeColors,
    loadColors,
    highlight,
    toggleHighlight,
    clusterLoop,
    fadeOut
}

export default actions