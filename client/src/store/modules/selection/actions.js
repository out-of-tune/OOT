import { getNodeUi, getAllNodes, getAllLinks, getNodePosition } from "@/assets/js/graphHelper"
import { handleTokenError } from '@/assets/js/TokenHelper.js'
import SpotifyService from '@/store/services/SpotifyService'
var fp = require('lodash/fp');
import Flatbush from 'flatbush';
import _ from "lodash"

function getNodesWithInBoundaries(rootState, topLeft, bottomRight){
    const nodes = getAllNodes(rootState)
    const index = new Flatbush(nodes.length)
    nodes.forEach(node=>{
        const ui = getNodeUi(rootState, node)
        index.add(ui.position.x - ui.size/2, ui.position.y - ui.size/2, ui.position.x + ui.size/2, ui.position.y + ui.size/2)
    })
    index.finish()
    return index.search(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y).map(id=>nodes[id])
}

const handleAreaSelected = ({ commit, dispatch, rootState }, { area }) => {
    const graphics = rootState.mainGraph.renderState.Renderer.getGraphics()
    var topLeft = graphics.transformClientToGraphCoordinates({
        x: area.x,
        y: area.y
    });

    var bottomRight = graphics.transformClientToGraphCoordinates({
        x: area.x + area.width,
        y: area.y + area.height
    });
    const selectedNodes = getNodesWithInBoundaries(rootState, topLeft, bottomRight)

    if (!_.isEqual(selectedNodes, rootState.selection.temporarySelectedNodes)) {
        if (rootState.selection.temporarySelectedNodes == 0) {
            dispatch("markNodes", _.uniq([...rootState.selection.selectedNodes, ...selectedNodes]))
        }
        //get difference between selectedNodes and temporary selected nodes in state
        const addedNodes = selectedNodes
            .filter(node => !rootState.selection.temporarySelectedNodes.includes(node))
            .filter(node => !rootState.selection.selectedNodes.includes(node))
        const deletedNodes = rootState.selection.temporarySelectedNodes
            .filter(node => !selectedNodes.includes(node))
            .filter(node => !rootState.selection.selectedNodes.includes(node))

        addedNodes.forEach((node) => {
            dispatch('setNodeOpacity', { node, opacity: "ff" })
        })
        deletedNodes.forEach((node) => {
            dispatch('setNodeOpacity', { node, opacity: "44" })
        })
        

        commit("SET_TEMPORARY_SELECTED", selectedNodes)
        commit("RERENDER_GRAPH")
    }
}

function getSelectedNodes(addToSelection, state){
    return addToSelection
    ? _.uniq([...state.selectedNodes, ...state.temporarySelectedNodes])
    : state.temporarySelectedNodes
}

const selectionFinished = ({commit, dispatch, state, rootState},{addToSelection}) =>{
    const selectedNodes = getSelectedNodes(addToSelection, state)
    dispatch('setSelectedNodes', selectedNodes)
    dispatch('setEdgesTransparent')
    if(selectedNodes.length==0){
        dispatch('applyNodeColorConfiguration')
        dispatch('applyEdgeColorConfiguration')
    }
    commit("SET_TEMPORARY_SELECTED", [])
    if(rootState.appearance.highlight){
        dispatch('storeColors')
    }
}

const setLinkOpacity = ({rootState, commit},{link, opacity}) => {
    const renderer = rootState.mainGraph.renderState.Renderer
    const color = renderer.getGraphics().getLinkUI(link.id).color.toString(16)
    const ncolor = color.substring(0, color.length - 2) + opacity
    commit("SET_EDGE_COLOR", { link, color: parseInt(ncolor, 16) })
}

const setNodeOpacity = ({rootState, commit},{node, opacity}) => {
    const color = getNodeUi(rootState, node).color.toString(16)
    const ncolor = color.substring(0, color.length - 2) + opacity
    commit("SET_NODE_COLOR", { node: node.id, color: parseInt(ncolor, 16) })
}

function getSelectedLinkIds(nodes){
    const nodesWithLinks = nodes.filter(node => node.links!==null)
    return nodesWithLinks.flatMap(node=>node.links.map(
        link=>link.id
    ))
}

function countUnique(array){
    return array.reduce((counted, current)=>{
        return { ...counted, [current]: (counted[current] || 0)+1 }
    }, {})
}

function categorizeLinks(links, linkCounts) {
    return links.reduce((categorizedLinks, currentLink)=>{
        const linkCount = linkCounts[currentLink.id]||0
        const category = linkCount>1
                        ? "colored"
                        : linkCount===1
                        ? "halfTransparent"
                        : "transparent"
        return { ...categorizedLinks, [category]: [...categorizedLinks[category], currentLink]}
    },{"colored": [], "halfTransparent": [], "transparent": []})
}

const setEdgesTransparent = ({ rootState, state, dispatch }) => {
    const allLinks = getAllLinks(rootState)
    const linkCounts = countUnique(getSelectedLinkIds(getSelectedNodes(true, state)))
    const categorizedLinks = categorizeLinks(allLinks, linkCounts)
    categorizedLinks.transparent.forEach(link => {
        dispatch('setLinkOpacity',{link, opacity: "44"})
    })
    categorizedLinks.halfTransparent.forEach(link => {
        dispatch('setLinkOpacity',{link, opacity: "88"})
    })
    categorizedLinks.colored.forEach(link=>{
        dispatch('setLinkOpacity',{link, opacity: "ff"})
    })
}

const markNodes = ({ dispatch, rootState }, nodes) => {
    const graph = rootState.mainGraph.Graph
    graph.forEachNode((node) => {
        dispatch('setNodeOpacity', { node, opacity: "44" })
    })
    nodes.forEach((node) => {
        dispatch('setNodeOpacity', { node, opacity: "ff" })
    })
}

const setSelectedNodes = ({ commit }, nodes) => {
    commit('SET_SELECTED_NODES', nodes)
}

const changeSelectionModalState = ({ commit, state }) => {
    commit('SET_SELECTION_MODAL_STATE', !state.modalOpen)
}

const moveToNextNode = ({ dispatch, commit, state }) => {
    if(state.selectedNodeIndex<state.selectedNodes.length-1){
        dispatch("moveToNode", state.selectedNodes[state.selectedNodeIndex+1])
        commit("SET_SELECTED_INDEX", state.selectedNodeIndex+1)
    }
    else {
        dispatch("moveToFirstNode")
    }
}

const moveToPreviousNode = ({ dispatch, commit, state }) => {
    if(state.selectedNodeIndex>0){
        dispatch("moveToNode", state.selectedNodes[state.selectedNodeIndex-1])
        commit("SET_SELECTED_INDEX", state.selectedNodeIndex-1)
    }
    else {
        dispatch("moveToLastNode")
    }
}

const moveToFirstNode = ({ dispatch, commit, state }) => {
    if(state.selectedNodes.length>0){
        dispatch("moveToNode", state.selectedNodes[0])
        commit("SET_SELECTED_INDEX", 0)
    }
}

const moveToLastNode = ({ dispatch, commit, state }) => {
    if(state.selectedNodes.length>0){
        dispatch("moveToNode", state.selectedNodes[state.selectedNodes.length-1])
        commit("SET_SELECTED_INDEX", state.selectedNodes.length-1)
    }
}

const updateSelectionUI = ({ dispatch }, nodes) => {
    dispatch("markNodes", nodes)
    dispatch('setEdgesTransparent')
}

const selectNodes = ({ dispatch }, nodes) => {
    dispatch("setSelectedNodes", nodes)
    dispatch("updateSelectionUI", nodes)
}

const deselect = ({ dispatch }) => {
    dispatch('setSelectedNodes', [])
    dispatch('applyNodeColorConfiguration')
    dispatch('applyEdgeColorConfiguration')
    dispatch('setInfo','Selection removed')
}

const selectAll = ({ dispatch, rootState }) => {
    dispatch("setInfo","Selected all nodes")
    dispatch("markNodes", getAllNodes(rootState))
    dispatch("setSelectedNodes", getAllNodes(rootState))
}



const expandSelectedNodes = async ({ dispatch, state }) => {
    await dispatch('expandAction', { nodes: state.selectedNodes })
    dispatch('applyAllConfigurations')
    dispatch('markNodes', state.selectedNodes)
    dispatch('setEdgesTransparent')
}

const collapseSelectedNodes = ({ dispatch, state }) => {
    state.selectedNodes.forEach(node=>dispatch('collapseAction', node))
}

const removeSelectedNodes = ({ commit, state, dispatch }) => {
    dispatch("setInfo", state.selectedNodes.length + " selected nodes removed")
    dispatch('addChange', {
        data: { nodes: _.cloneDeep(state.selectedNodes), links: [] }, type: 'remove'
    })
    state.selectedNodes.forEach(node=>commit('REMOVE_NODE', node))
    dispatch("setSelectedNodes",[])
    dispatch("applyAllConfigurations")
}

const addSelectedSongsToQueue = async ({rootState, state, dispatch}, sids) => {
    const selectedSongNodeSids = sids 
      ? sids 
      : state.selectedNodes.filter(node => node.data.label === "song").map(node => node.data.sid)

    function fetchData(ids, token){
        return SpotifyService.getFullSongData(token, ids)
    }
    const chunks = fp.chunk(50)(selectedSongNodeSids)
    const promises = chunks.map(chunk=>{
        return handleTokenError(fetchData, [chunk], dispatch, rootState)
    })
    const result = (await Promise.all(promises)).flatMap((chunk)=>chunk.tracks)
    result.forEach(song => {
        dispatch("addToQueue", song)
    })
    dispatch("setSuccess", "Added "+ selectedSongNodeSids.length +" songs to queue")
}

function getRandom(list){
  const i = Math.floor(Math.random() * list.length);
  return list[i]
}

const addSongsFromSelectedAlbumsToQueue = async ({rootState, state, dispatch}) => {
    const selectedAlbumNodes = state.selectedNodes.filter(node => node.data.label === "album")
    const selectedAlbumNodeSids = selectedAlbumNodes.map((node) => node.data.sid)

    function fetchData(sid, token){
        return SpotifyService.getSongsFromAlbum(token, sid)
    }
    const promises = selectedAlbumNodeSids.map(sid=>{
        return handleTokenError(fetchData, [sid], dispatch, rootState)
    })
    const result = await Promise.all(promises)
    const songSids = result.map(album => {
        return getRandom(album.items).id
    })
    dispatch('addSelectedSongsToQueue', songSids)
}

const pinNodes = ({commit, dispatch}, nodes) => {
    nodes.forEach((node)=> {
        commit("PIN_NODE", node)
    })
    dispatch("setInfo", nodes.length + " nodes pinned")

}

const unpinNodes = ({commit, dispatch}, nodes) => {
    nodes.forEach((node)=> {
        commit("UNPIN_NODE", node)
    })
    dispatch("setInfo", nodes.length + " nodes released")

}

const invertSelection = ({rootState, dispatch}) => {
    if(rootState.selection.selectedNodes.length>0){
        const selectedSongNodeIds = rootState.selection.selectedNodes.reduce((oldObject, node) => ({...oldObject, [node.id]:node.id}),{})
        const invertedSelection = getAllNodes(rootState).filter((node) => !selectedSongNodeIds[node.id])
        dispatch("setSelectedNodes", invertedSelection)
        dispatch("updateSelectionUI", invertedSelection)
    }
}

const moveSelection = ({rootState, commit}, {originNode, nodesWithPositionToMove, oldOriginPosition}) => {
    const newPosition = getNodePosition(rootState, originNode)
    const xDifference = oldOriginPosition.x - newPosition.x
    const yDifference = oldOriginPosition.y - newPosition.y
    nodesWithPositionToMove.forEach((node)=>{
        if(node.node.id!==originNode.id){
            commit("SET_NODE_POSITION", {
                nodeId: node.node.id,
                xPosition: node.position.x - xDifference,
                yPosition: node.position.y - yDifference
            })
        }
    })
    
}
export const actions = {
    markNodes,
    setSelectedNodes,
    changeSelectionModalState,
    expandSelectedNodes,
    collapseSelectedNodes,
    removeSelectedNodes,
    moveToNextNode,
    moveToFirstNode,
    moveToPreviousNode,
    moveToLastNode,
    handleAreaSelected,
    setEdgesTransparent,
    selectionFinished,
    setLinkOpacity,
    setNodeOpacity,
    updateSelectionUI,
    selectNodes,
    deselect,
    selectAll,
    addSelectedSongsToQueue,
    addSongsFromSelectedAlbumsToQueue,
    pinNodes,
    unpinNodes,
    invertSelection,
    moveSelection
}
export default actions
