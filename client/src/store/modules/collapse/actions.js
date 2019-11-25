import { getConnectedNodesAndLinks } from "@/assets/js/graphHelper.js"

function getEdgeConfigurationForNode(rootState, node) {
    const collapseConfigurations = rootState.configurations.actionConfiguration.collapse
    const edges = collapseConfigurations
        .filter(collapseConfiguration => collapseConfiguration.nodeType == node.data.label)
        .flatMap(collapseConfiguration => collapseConfiguration.edges)
    return edges
}

function getLinksToRemove(nodesWithLink, edgeTypesToRemove) {
    return nodesWithLink
        .filter((nodeWithLink) => {
            return nodeWithLink.link.linkTypes.filter((linkType) => !edgeTypesToRemove.includes(linkType)).length == 0
        })
        .map((nodeWithLink) => {
            return nodeWithLink.link
        })
}

function getLinksToUpdate(nodesWithLink, edgeTypesToRemove) {
    return nodesWithLink
        .filter((nodeWithLink) => {
            return nodeWithLink.link.linkTypes.filter((linkType) => !edgeTypesToRemove.includes(linkType)).length != 0
        })
        .map((nodeWithLink) => {
            const {
                linkTypes,
                ...data
            } = nodeWithLink.link
            const updatedLinkTypes = nodeWithLink.link.linkTypes.filter((linkType) => !edgeTypesToRemove.includes(linkType))
            return {
                ...data,
                linkTypes: updatedLinkTypes
            }
        })
}

function getNodesToRemove(rootState, nodesWithLink, edgeTypesToRemove) {
    return nodesWithLink
        .filter((nodeWithLink) => {
            const isConnectedLinkRemoved = nodeWithLink.link.linkTypes.filter((linkType) => !edgeTypesToRemove.includes(linkType)).length == 0
            const hasNodeConnectionsLeft = rootState.mainGraph.Graph.getLinks(nodeWithLink.node.id).length == 1
            return isConnectedLinkRemoved && hasNodeConnectionsLeft
        })
        .map((nodeWithLink) => {
            return nodeWithLink.node
        })
}

function getConnectedNodesAndLinksToChange(rootState, node) {
    const edgeTypesToRemove = getEdgeConfigurationForNode(rootState, node)
    const nodesWithLink = getConnectedNodesAndLinks({graph: rootState.mainGraph.Graph, node})

    const linksToRemove = getLinksToRemove(nodesWithLink, edgeTypesToRemove)
    const linksToUpdate = getLinksToUpdate(nodesWithLink, edgeTypesToRemove)
    const nodesToRemove = getNodesToRemove(rootState, nodesWithLink, edgeTypesToRemove)

    return {
        linksToRemove,
        nodesToRemove,
        linksToUpdate,
        edgeTypesToRemove
    }
}

function changeNodesAndLinks(commit, itemsToChange) {
    itemsToChange.linksToUpdate.forEach((linkToUpdate) => {
        commit("UPDATE_LINKTYPES", linkToUpdate)
    })
    itemsToChange.linksToRemove.forEach((link) => {
        commit("REMOVE_LINK", link)
    })
    itemsToChange.nodesToRemove.forEach((node) => {
        commit("REMOVE_NODE", node)
    })
}

const collapseAction = ({ commit, rootState, dispatch }, node) => {
    const itemsToChange = getConnectedNodesAndLinksToChange(rootState, node)
    changeNodesAndLinks(commit, itemsToChange)
    const changedLinks = [...itemsToChange.linksToRemove, ...itemsToChange.linksToUpdate]

    dispatch('addChange', {
        data: { 
            nodes: itemsToChange.nodesToRemove, 
            links: changedLinks
        },
        type: 'remove'
    })
}

export const actions = {
    collapseAction
}

export default actions