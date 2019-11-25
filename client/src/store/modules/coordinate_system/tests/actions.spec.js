import {
  actions,
  testActions
} from '../actions'
global.expect = require('expect')
import Viva from "vivagraphjs";


const {
  removePinnedStateFromNodeType,
  setConnectedNodesNearby,
  applyNodeCoordinateSystemLine,
  applyCoordinateSystems,
  applyNodeCoordinateSystem,
  setCoordinateSystemConfiguration,
  unpinAllNodes,
  applyNodeCoordinateSystemMap
} = actions

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

describe("unpinAllNodes", () => {
  let commit
  let rootState
  beforeEach(() => {
    commit = jest.fn()
    rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
      }
    }
    const nodes = [{
        id: "Werk/1",
        data: {
          Location: "1020",
          label: "Werk"
        }
      },
      {
        id: "Werk/2",
        data: {
          Location: "3333",
          label: "Werk"
        }
      },
      {
        id: "Werk/3",
        data: {
          Location: "1010",
          label: "Werk"
        }
      },
      {
        id: "Material/2",
        data: {
          name: "karl",
          label: "Material"
        }
      },
      {
        id: "Material/1",
        data: {
          name: "franz",
          label: "Material"
        }
      }
    ]
    const edges = [{
        fromId: "Werk/1",
        toId: "Material/2"
      },
      {
        fromId: "Werk/1",
        toId: "Material/1"
      },
    ]
    nodes.forEach((node) => {
      rootState.mainGraph.Graph.addNode(node.id, node.data);
    })
    edges.forEach((edge) => {
      var lonk = rootState.mainGraph.Graph.addLink(edge.fromId, edge.toId);
    })
  })
  it("calls UNPIN_NODE for Each node", () => {
    unpinAllNodes({
      rootState,
      commit
    })
    expect(commit).toHaveBeenCalledTimes(5)
  })
})
describe("removePinnedStateFromNodeType", () => {
  let commit
  let rootState
  beforeEach(() => {
    commit = jest.fn()
    rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
      }
    }
    const nodes = [{
        id: "Werk/1",
        data: {
          Location: "1020",
          label: "Werk"
        }
      },
      {
        id: "Werk/2",
        data: {
          Location: "3333",
          label: "Werk"
        }
      },
      {
        id: "Werk/3",
        data: {
          Location: "1010",
          label: "Werk"
        }
      },
      {
        id: "Material/2",
        data: {
          name: "karl",
          label: "Material"
        }
      },
      {
        id: "Material/1",
        data: {
          name: "franz",
          label: "Material"
        }
      }
    ]
    const edges = [{
        fromId: "Werk/1",
        toId: "Material/2"
      },
      {
        fromId: "Werk/1",
        toId: "Material/1"
      },
    ]
    nodes.forEach((node) => {
      rootState.mainGraph.Graph.addNode(node.id, node.data);
    })
    edges.forEach((edge) => {
      var lonk = rootState.mainGraph.Graph.addLink(edge.fromId, edge.toId);
    })
  })
  it("calls UNPIN_NODE for Each node with the corresponding label", () => {
    removePinnedStateFromNodeType({
      rootState,
      commit
    }, "Werk")
    expect(commit).toHaveBeenCalledTimes(3)
  })
})
describe("setConnectedNodesNearby", () => {
  let commit
  let rootState
  beforeEach(() => {
    commit = jest.fn()
    rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        renderState: {
          layout: {
            isNodePinned: jest.fn((node) => false)
          }
        }
      }
    }
    const nodes = [{
        id: "Werk/1",
        data: {
          Location: "1020",
          label: "Werk"
        }
      },
      {
        id: "Werk/2",
        data: {
          Location: "3333",
          label: "Werk"
        }
      },
      {
        id: "Werk/3",
        data: {
          Location: "1010",
          label: "Werk"
        }
      },
      {
        id: "Material/2",
        data: {
          name: "karl",
          label: "Material"
        }
      },
      {
        id: "Material/1",
        data: {
          name: "franz",
          label: "Material"
        }
      }
    ]
    const edges = [{
        fromId: "Werk/1",
        toId: "Material/2"
      },
      {
        fromId: "Werk/1",
        toId: "Material/1"
      },
    ]
    nodes.forEach((node) => {
      rootState.mainGraph.Graph.addNode(node.id, node.data);
    })
    edges.forEach((edge) => {
      var lonk = rootState.mainGraph.Graph.addLink(edge.fromId, edge.toId);
    })
  })
  it("calls SET_NODE_POSITION for each node when no nodes are pinned", () => {
    setConnectedNodesNearby({
      rootState,
      commit
    }, {
      node: {
        id: "Werk/1"
      },
      xPosition: 0,
      yPosition: 0
    })
    expect(commit).toHaveBeenCalledTimes(2)
  })
})
describe("applyNodeCoordinateSystemLine", () => {
  let commit
  let rootState
  let params
  beforeEach(() => {
    commit = jest.fn()
    rootState = {
      selection: {
        selectedNodes: [{ id: "Artist/1", data: { label: "Artist", name: "Ziggy" } }, { id: "Artist/2", data: { label: "Artist", name: "Shaggy" } }, { id: "Artist/3", data: { label: "Artist", name: "Eggsy" } }]
      }
    }
    params = {
      xOffset: 0,
      yOffset: 0,
      slope: 0,
      distance: 50,
      invertedAxis: false
    }
  })
  it("pins all nodes", () => {
    applyNodeCoordinateSystemLine({ commit, rootState }, params)
    expect(commit).toHaveBeenCalledTimes(6)
    expect(commit).toHaveBeenLastCalledWith("PIN_NODE", rootState.selection.selectedNodes[2])
  })
  it("draws a flat line on the x axis", () => {
    applyNodeCoordinateSystemLine({ commit, rootState }, params)
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/3", xPosition: 0, yPosition: -0 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/2", xPosition: 50, yPosition: -0 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/1", xPosition: 100, yPosition: -0 })
  })
  it("draws a flat line on the y axis", () => {
    params.invertedAxis = true
    applyNodeCoordinateSystemLine({ commit, rootState }, params)
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/3", xPosition: 0, yPosition: -0 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/2", xPosition: 0, yPosition: -50 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/1", xPosition: 0, yPosition: -100 })
  })
  it("draws a slope", () => {
    params.slope = 1
    applyNodeCoordinateSystemLine({ commit, rootState }, params)
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/3", xPosition: 0, yPosition: -0 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/2", xPosition: 50, yPosition: -50 })
    expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", { nodeId: "Artist/1", xPosition: 100, yPosition: -100 })
  })
})