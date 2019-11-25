import {
  actions
} from '../actions'
global.expect = require('expect')
import Viva from "vivagraphjs";

const {
  collapseAction
} = actions

describe("collapseAction", () => {
  it("removes all connections as specified in configuration", () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    
    const collapseOptions = [{
      nodeType: "abc",
      edges: ["Soup"]
    }, {
      nodeType: "cde",
      edges: ["Soup"]
    }, {
      nodeType: "efg",
      edges: ["Stew"]
    }]
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {}
        },
        hoveredNode: {
          id: 0,
          data: {}
        },
        displayState: {
          displayEdges: true,
          showTooltip: false
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2
          }
        }
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions
        }
      }
    }
    const nodes = [{
        id: 1,
        data: {
          name: "bob",
          label: "abc"
        }
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde"
        }
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 1,
        toId: 3
      },
      {
        fromId: 2,
        toId: 3
      }
    ]
    var graph = rootState.mainGraph.Graph
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    })
    var linksErg = []
    edges.forEach((edge) => {
      var lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"]
      linksErg.push(lonk)
    })

    collapseAction({
      commit,
      rootState,
      dispatch
    }, {
      id: 1,
      data: {
        name: "bob",
        label: "abc"
      }
    })
    expect(commit).toHaveBeenNthCalledWith(1, "REMOVE_LINK", linksErg[0])
    expect(commit).toHaveBeenNthCalledWith(2, "REMOVE_LINK", linksErg[1])

  })
  it("removes formerly connected Nodes if they have no connection left", () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    const collapseOptions = [{
      nodeType: "abc",
      edges: ["Soup"]
    }, {
      nodeType: "cde",
      edges: ["Soup"]
    }, {
      nodeType: "efg",
      edges: ["Stew"]
    }]
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {}
        },
        hoveredNode: {
          id: 0,
          data: {}
        },
        displayState: {
          displayEdges: true,
          showTooltip: false
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2
          }
        }
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions
        }
      }
    }
    const nodes = [{
        id: 1,
        data: {
          name: "bob",
          label: "abc"
        }
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde"
        }
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 1,
        toId: 3
      },
    ]
    var graph = rootState.mainGraph.Graph
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    })
    var linksErg = []
    edges.forEach((edge) => {
      var lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"]
      linksErg.push(lonk)
    })

    collapseAction({
      commit,
      rootState,
      dispatch
    }, {
      id: 1,
      data: {
        name: "bob",
        label: "abc"
      }
    })
    expect(commit).toHaveBeenNthCalledWith(3, "REMOVE_NODE", {
      "data": {
        "label": "cde",
        "name": "karl"
      },
      "id": 2,
      "links": [{
        "data": undefined,
        "fromId": 1,
        "id": "1👉 2",
        "linkTypes": ["Soup"],
        "toId": 2
      }]
    })
    expect(commit).toHaveBeenNthCalledWith(4, "REMOVE_NODE", {
      "data": {
        "label": "cde",
        "name": "franz"
      },
      "id": 3,
      "links": [{
        "data": undefined,
        "fromId": 1,
        "id": "1👉 3",
        "linkTypes": ["Soup"],
        "toId": 3
      }]
    })

  })
  it("doesn't removes formerly connected Nodes if they have a connection left", () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    const collapseOptions = [{
      nodeType: "abc",
      edges: ["Soup"]
    }, {
      nodeType: "cde",
      edges: ["Soup"]
    }, {
      nodeType: "efg",
      edges: ["Stew"]
    }]
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {}
        },
        hoveredNode: {
          id: 0,
          data: {}
        },
        displayState: {
          displayEdges: true,
          showTooltip: false
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2
          }
        }
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions
        }
      }
    }
    const nodes = [{
        id: 1,
        data: {
          name: "bob",
          label: "abc"
        }
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde"
        }
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 1,
        toId: 3
      },
      {
        fromId: 2,
        toId: 3
      }
    ]
    var graph = rootState.mainGraph.Graph
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    })
    var linksErg = []
    edges.forEach((edge) => {
      var lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"]
      linksErg.push(lonk)
    })

    collapseAction({
      commit,
      rootState,
      dispatch
    }, {
      id: 1,
      data: {
        name: "bob",
        label: "abc"
      }
    })
    expect(commit).toHaveBeenLastCalledWith("REMOVE_LINK", linksErg[1])

  })
  it("removes nothing if configuration is set correspondingly", () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    const collapseOptions = []
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {}
        },
        hoveredNode: {
          id: 0,
          data: {}
        },
        displayState: {
          displayEdges: true,
          showTooltip: false
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2
          }
        }
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions
        }
      }
    }
    const nodes = [{
        id: 1,
        data: {
          name: "bob",
          label: "abc"
        }
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde"
        }
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 1,
        toId: 3
      },
      {
        fromId: 2,
        toId: 3
      }
    ]
    var graph = rootState.mainGraph.Graph
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    })
    var linksErg = []
    edges.forEach((edge) => {
      var lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"]
      linksErg.push(lonk)
    })

    collapseAction({
      commit,
      rootState,
      dispatch
    }, {
      id: 1,
      data: {
        name: "bob",
        label: "abc"
      }
    })
    expect(commit).toHaveBeenNthCalledWith(1, "UPDATE_LINKTYPES", expect.anything())
    expect(commit).toHaveBeenNthCalledWith(2, "UPDATE_LINKTYPES", expect.anything())

  })
})