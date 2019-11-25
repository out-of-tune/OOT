import { getNodesByLabel, getAllNodes,getPinnedState } from '@/assets/js/graphHelper'

const removePinnedStateFromNodeType = ({ commit, rootState }, label) => {
    getNodesByLabel(label, rootState).forEach(node => {
        commit("UNPIN_NODE", node)
    })
}

function parseParameter(nodes, sortParameter) {
    const parsedNodes = nodes.map(node => {
        const {
            data: {
                [sortParameter]: param,
                ...innerData
            },
            ...outerData
        } = node
        const parsedValue = parseFloat(param)
        return {
            ...outerData,
            data: {
                ...innerData,
                [sortParameter]: parsedValue
            }
        }
    })
    const nodeCount = parsedNodes.reduce((currentCount, parsedNode) => {
        return parsedNode["data"][sortParameter] ? currentCount + 1 : currentCount
    }, 0)
    return nodeCount / nodes.length > 0.9 ? parsedNodes : nodes
}

function sortByDataParameter(sortParameter) {
    return (a, b) => (a["data"][sortParameter] > b["data"][sortParameter]) ? 1 : ((b["data"][sortParameter] > a["data"][sortParameter]) ? -1 : 0)
}

function sortNodes(nodes) {
    return nodes.sort(sortByDataParameter("name"))
}

const setConnectedNodesNearby = ({
    commit,
    rootState
}, {
    node,
    xPosition,
    yPosition
}) => {
    rootState.mainGraph.Graph.forEachLinkedNode(node.id, (linkedNode) => {
        if (!getPinnedState(rootState, linkedNode)) {
            commit("SET_NODE_POSITION", {
                nodeId: linkedNode.id,
                xPosition: xPosition - Math.random() * 10,
                yPosition: yPosition - Math.random() * 10
            })
        }
    })
}

const applyNodeCoordinateSystemLine = ({
    commit,
    rootState
}, {
    xOffset = 0,
    yOffset = 0,
    slope = 0,
    distance = 50,
    invertedAxis = false
}) => {

    const nodes = rootState.selection.selectedNodes
    const sortedNodes = sortNodes(nodes)
    sortedNodes.forEach((node, index) => {
        const dimensionOnePosition = distance * index
        const dimensionTwoPosition = slope * dimensionOnePosition
        const xPosition = xOffset + ((invertedAxis) ? dimensionTwoPosition : dimensionOnePosition)
        const yPosition = -yOffset + ((invertedAxis) ? -dimensionOnePosition : -dimensionTwoPosition)
        commit("SET_NODE_POSITION", {
            nodeId: node.id,
            xPosition,
            yPosition
        })
        commit("PIN_NODE", node)
    })
}



function rangeMap(valueToMap, in_min, in_max, out_min, out_max) {
    return (valueToMap - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function getAttributeValues(nodes, attribute) {
    return nodes.map(node => {
        return parseFloat(node["data"][attribute])
    })
}

function getMinValue(nodes, attribute) {
    return getAttributeValues(nodes, attribute).reduce((minValue, currentValue) => {

        return currentValue < minValue ? currentValue : minValue
    })
}

function getMaxValue(nodes, attribute) {
    return getAttributeValues(nodes, attribute).reduce((maxValue, currentValue) => {
        return currentValue > maxValue ? currentValue : maxValue
    })
}

function gaussianRand() {
    var rand = 0;
  
    for (var i = 0; i < 6; i += 1) {
      rand += Math.random();
    }
  
    return rand / 6;
  }

function calculateJitter(value, jitter){
    return gaussianRand()*jitter + value - jitter/2
}

const applyNodeCoordinateSystemMap = ({
    commit,
    dispatch,
    rootState
}, {
    nodeLabel,
    xOffset,
    yOffset,
    xAttributeKey,
    yAttributeKey,
    mapXLength,
    mapYLength,
    xBoundaryMin,
    yBoundaryMin,
    xBoundaryMax,
    yBoundaryMax,
    jitter
}) => {
    const nodes = getNodesByLabel(nodeLabel, rootState) 
    if(nodes.length > 0){
        const boundaries = (xBoundaryMin>0&&xBoundaryMax>0&&yBoundaryMin>0&&yBoundaryMin>0) ? {
            xMin: (xBoundaryMin),
            yMin: (yBoundaryMin),
            xMax: (xBoundaryMax),
            yMax: (yBoundaryMax)
        }
        : {
            xMin: getMinValue(nodes, xAttributeKey),
            yMin: getMinValue(nodes, yAttributeKey),
            xMax: getMaxValue(nodes, xAttributeKey),
            yMax: getMaxValue(nodes, yAttributeKey)
        }
        if(!(isNaN(boundaries.xMin)||isNaN(boundaries.yMin)||isNaN(boundaries.xMax)||isNaN(boundaries.yMax))){
            nodes.forEach((node) => {
                const xPosition = rangeMap(node["data"][xAttributeKey], boundaries.xMin, boundaries.xMax, 0, mapXLength) + xOffset
                const yPosition = -rangeMap(node["data"][yAttributeKey], boundaries.yMin, boundaries.yMax, 0, mapYLength) - yOffset

                const jitteredXPosition = jitter? calculateJitter(xPosition, parseFloat(mapXLength)/200): xPosition
                const jitteredYPosition = jitter? calculateJitter(yPosition, parseFloat(mapYLength)/200): yPosition

                commit("SET_NODE_POSITION", {
                    nodeId: node.id,
                    xPosition: jitteredXPosition,
                    yPosition: jitteredYPosition
                })
                commit("PIN_NODE", node)
                dispatch("setConnectedNodesNearby", {
                    node,
                    xPosition: jitteredXPosition,
                    yPosition: jitteredYPosition
                })
            })
        }
    }
}

const unpinAllNodes = ({ rootState, commit }) => {
    getAllNodes(rootState).forEach(node=>{
        commit("UNPIN_NODE", node)
    })
}

const applyNodeCoordinateSystem = ({
    dispatch
}, {
    nodeLabel,
    layoutTypeOptions,
    layoutType
}) => {
    switch (layoutType) {
        case "line":
            dispatch("applyNodeCoordinateSystemLine", {
                nodeLabel: nodeLabel,
                ...layoutTypeOptions
            })
            break
        case "map":
            dispatch("applyNodeCoordinateSystemMap", {
                nodeLabel: nodeLabel,
                ...layoutTypeOptions
            })
            break
    }
}

const applyCoordinateSystems = ({
    rootState,
    dispatch
}) => {
    dispatch("unpinAllNodes")
    rootState.configurations.layoutConfiguration.forEach((configuration) => {
        dispatch('applyNodeCoordinateSystem', configuration)
    })
}



function parseLineConfiguration(configuration) {
    const {
        layoutTypeOptions: {
            xOffset,
            yOffset,
            slope,
            distance,
            ...layoutTypeOptionsData
        },
        ...data
    } = configuration
    const parsedXOffset = parseFloat(xOffset)
    const parsedYOffset = parseFloat(yOffset)
    const parsedSlope = parseFloat(slope)
    const parsedDistance = parseFloat(distance)
    return {
        ...data,
        layoutTypeOptions: {
            xOffset: parsedXOffset,
            yOffset: parsedYOffset,
            slope: parsedSlope,
            distance: parsedDistance,
            ...layoutTypeOptionsData
        }
    }
}

function parseMapConfiguration(configuration) {
    const {
        layoutTypeOptions: {
            xOffset,
            yOffset,
            mapXLength,
            mapYLength,
            xBoundaryMin,
            xBoundaryMax,
            yBoundaryMin,
            yBoundaryMax,
            ...layoutTypeOptionsData
        },
        ...data
    } = configuration
    const parsedXOffset = parseFloat(xOffset)
    const parsedYOffset = parseFloat(yOffset)
    const parsedMapXLength = parseFloat(mapXLength)
    const parsedMapYLength = parseFloat(mapYLength)
    const parsedXBoundaryMin = xBoundaryMin!==""?parseFloat(xBoundaryMin): 0
    const parsedYBoundaryMin = yBoundaryMin!==""?parseFloat(yBoundaryMin): 0
    const parsedXBoundaryMax = xBoundaryMax!==""?parseFloat(xBoundaryMax): 0
    const parsedYBoundaryMax = yBoundaryMax!==""?parseFloat(yBoundaryMax): 0

    return {
        ...data,
        layoutTypeOptions: {
            xOffset: parsedXOffset,
            yOffset: parsedYOffset,
            mapXLength: parsedMapXLength,
            mapYLength: parsedMapYLength,
            xBoundaryMin: parsedXBoundaryMin,
            yBoundaryMin: parsedYBoundaryMin,
            xBoundaryMax: parsedXBoundaryMax,
            yBoundaryMax: parsedYBoundaryMax,
            ...layoutTypeOptionsData
        }
    }
}


function commitConfigurationToState(rootState, commit, configuration) {
    const labels = rootState.configurations.layoutConfiguration.map(entry => entry.nodeLabel)
    if (labels.includes(configuration.nodeLabel)) {
        commit("CHANGE_LAYOUT_CONFIGURATION", configuration)
    } else {
        commit("ADD_LAYOUT_CONFIGURATION", configuration)
    }
}
const setCoordinateSystemConfiguration = ({ rootState, commit }, configuration) => {
    if (configuration.layoutType === 'force') {
        commit('DELETE_LAYOUT_CONFIGURATION', configuration.nodeLabel)
    } else if (configuration.layoutType == "line") {
        const parsedConfiguration = parseLineConfiguration(configuration)
        commitConfigurationToState(rootState, commit, parsedConfiguration)
    } else if (configuration.layoutType == "map") {
        const parsedConfiguration = parseMapConfiguration(configuration)
        commitConfigurationToState(rootState, commit, parsedConfiguration)
    }
}

export const actions = {
    removePinnedStateFromNodeType,
    applyNodeCoordinateSystemLine,
    applyCoordinateSystems,
    applyNodeCoordinateSystem,
    setCoordinateSystemConfiguration,
    unpinAllNodes,
    setConnectedNodesNearby,
    applyNodeCoordinateSystemMap
}
export const testActions = {
    getNodesByLabel
}

export default actions