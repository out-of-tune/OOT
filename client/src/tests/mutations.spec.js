import {
  mutations
} from '../store/mutations'
expect = require('expect')

// destructure assign `mutations`
const {
  SET_HOVERED_NODE,
  SET_GRAPHCONTAINER,
  CREATE_GRAPH,
  SET_RENDERER,
  ADD_TO_GRAPH,
  DELETE_NODES_FROM_GRAPH,
  SHOW_EDGES,
  START_RENDERER,
  ADD_NODE_RULE,
  UPDATE_NODE_RULESET
} = mutations

const getState = () => {
  return {
    mainGraph: {
      graphContainer: {},
      Graph: {},
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
    queue: [],
    SearchQuery: ""
  }
}

describe('SET_HOVERED_NODE', () => {
  it('sets the node correctly', () => {
    const state = {
      mainGraph: {}
    }
    const node = {
      data: "test"
    }
    SET_HOVERED_NODE(state, node)
    expect(state.mainGraph.hoveredNode).toBe(node)
  })
})

describe('SET_GRAPHCONTAINER', () => {
  it('writes the given graphcontainer to the state', () => {
    const state = {
      mainGraph: {
        graphContainer: {}
      }
    }
    const container = {
      id: "graph-container"
    }
    SET_GRAPHCONTAINER(state, container)
    expect(state.mainGraph.graphContainer).toBe(container)
  })
})

describe('CREATE_GRAPH', () => {
  it('creates a graph object', () => {
    const state = {
      mainGraph: {
        Graph: null
      }
    }
    CREATE_GRAPH(state)
    expect(state.mainGraph.Graph).toBeTruthy()
  })
})

describe('SET_RENDERER', () => {
  it('creates and sets the renderer', () => {
    const container = document.createElement('div')
    let state = {
      mainGraph: {
        Graph: null,
        graphContainer: container,
        renderState: {
          Renderer: null,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2
          }
        }
      }
    }
    CREATE_GRAPH(state)

    SET_RENDERER(state)

    const actual = state.mainGraph.renderState.Renderer

    expect(actual).toBeTruthy()
  })
})

describe('ADD_TO_GRAPH', () => {
  it('adds all nodes to the graph', () => {
    let state = getState()
    const nodes = [{
        id: 1,
        data: {
          name: "bob"
        }
      },
      {
        id: 2,
        data: {
          name: "karl"
        }
      }
    ]
    CREATE_GRAPH(state)

    ADD_TO_GRAPH(state, {
      nodes
    })

    const actual = state.mainGraph.Graph.getNodesCount()
    const expected = nodes.length

    expect(actual).toBe(expected)
  })
  it('adds only links that are not already in the graph', () => {
    let state = getState()
    const nodes = [{
        id: 1,
        data: {
          name: "bob"
        }
      },
      {
        id: 2,
        data: {
          name: "karl"
        }
      },
      {
        id: 3,
        data: {
          name: "franz"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 2,
        toId: 3
      },
      {
        fromId: 2,
        toId: 3
      }
    ]

    const edges2 = [{
      fromId: 1,
      toId: 2
    }]

    const uniqueEdges = [{
        fromId: 1,
        toId: 2
      },
      {
        fromId: 2,
        toId: 3
      },
      {
        fromId: 1,
        toId: 3
      }
    ]

    CREATE_GRAPH(state)

    ADD_TO_GRAPH(state, {
      links: edges2
    })
    ADD_TO_GRAPH(state, {
      nodes,
      links: edges
    })
    ADD_TO_GRAPH(state, {
      links: uniqueEdges
    })

    // const actual = state.mainGraph.Graph.getLinksCount()

    let actualEdges = []
    state.mainGraph.Graph.forEachLink((link) => {
      actualEdges.push(link)
    })

    const actual = actualEdges.length
    const expected = uniqueEdges.length

    expect(actual).toBe(expected)
  })
  it('adds an array of links to the link object when the link is in the graph', () => {
    let state = getState()
    const nodes = [{
        id: 1,
        data: {
          name: "bob"
        }
      },
      {
        id: 2,
        data: {
          name: "karl"
        }
      },
      {
        id: 3,
        data: {
          name: "franz"
        }
      }
    ]
    const edges = [{
        fromId: 1,
        toId: 2,
        linkName: "Eins"
      },
      {
        fromId: 2,
        toId: 3,
        linkName: "Eins"
      },
      {
        fromId: 2,
        toId: 3,
        linkName: "Zwei"
      }
    ]

    CREATE_GRAPH(state)

    ADD_TO_GRAPH(state, {
      nodes,
      links: edges
    })

    const link = state.mainGraph.Graph.getLink(2, 3)

    const actual = link.linkTypes.length
    const expected = 2

    expect(actual).toBe(expected)

  })
})

describe('DELETE_NODES_FROM_GRAPH', () => {
  it('deletes all nodes with certain label', () => {
    let state = getState()
    const nodes = [{
        id: 1,
        data: {
          name: "bob",
          label: "Artist"
        }
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "Artist"
        }
      },
      {
        id: 3,
        data: {
          name: "Pop",
          label: "Genre"
        }
      }
    ]
    CREATE_GRAPH(state)

    ADD_TO_GRAPH(state, {
      nodes
    })

    DELETE_NODES_FROM_GRAPH(state, {
      label: "Artist"
    })

    const actual = state.mainGraph.Graph.getNodesCount()
    const expected = 1

    expect(actual).toBe(expected)
  })
})

describe('ADD_NODE_RULE', () => {
  let state
  beforeEach(() => {
    state = {
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: []
          }
        }
      }
    }
  })
  it('adds a color node rule', () => {
    let searchObject = {
      nodeType:"Auftrag",
      attributes: []
    }
    let searchString = "Auftrag"
    let type = "color"

    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args:{
        color: "ffffffff"
      }
    })
    expect(state.configurations.appearanceConfiguration.nodeConfiguration.color).toStrictEqual([{
      nodeLabel: "Auftrag",
      rules:[{
          searchObject, 
          searchString,
          color: "ffffffff"
      }]}]
      )
  })
  it('adds a size node rule', () => {
    let searchObject = {
      nodeType:"Auftrag",
      attributes: []
    }
    let searchString = "Auftrag"
    let type = 'size'
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args:{
        size: 12
      }
    })
    expect(state.configurations.appearanceConfiguration.nodeConfiguration.size).toStrictEqual([{
      nodeLabel: "Auftrag",
      rules:[{
          searchObject, 
          searchString,
          size: 12
      }]}]
    )
  })
  it('adds a size mapped node rule',()=>{
    let searchObject = {
      nodeType:"Auftrag",
      attributes: [{attributeSearch: "value", operator: "=", data:"irrelevant"}]
    }
    let searchString = "Auftrag"
    let type = 'size'
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args:{
        sizeType: "map",
        min: 10,
        max: 20
      }
    })
    expect(state.configurations.appearanceConfiguration.nodeConfiguration.size).toStrictEqual([{
      nodeLabel: "Auftrag",
      rules:[{
          searchObject, 
          searchString,
          sizeType: "map",
          min: 10,
          max: 20
      }]}])
    })
  it('adds a color node rule when rules are already there', () => {
    state.configurations.appearanceConfiguration.nodeConfiguration.color = [{
      nodeLabel: "Auftrag",
      rules:[{
          searchObject: {
            nodeType:"Auftrag",
            attributes: []
          }, 
          searchString: "Auftrag",
          color: "ffffffff"
    }]}]
    let searchObject = {
      nodeType:"Auftrag",
      attributes: [{attributeSearch: "name", operator:"=", attruteData:"N123"}]
    }
    let searchString = "Auftrag: name=N123"
    let type = 'color'
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args:{
        color: "abcdefaa"
      }
    })
    expect(state.configurations.appearanceConfiguration.nodeConfiguration.color).toStrictEqual(
      [{
        nodeLabel: "Auftrag",
        rules:[{
            searchObject: {
              nodeType:"Auftrag",
              attributes: []
            }, 
            searchString: "Auftrag",
            color: "ffffffff"
      },{
            searchObject, 
            searchString,
            color: "abcdefaa"
      }]}
    ]
    )
  })
})

describe('UPDATE_NODE_RULESET', () => {
  let state
  beforeEach(() => {
    state = {
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: []
          }
        }
      }
    }
  })
  it('updates node color ruleset', () => {
    state.configurations.appearanceConfiguration.nodeConfiguration.color = [{
      nodeLabel: "Auftrag",
      rules:[{
          searchObject: {
            nodeType:"Auftrag",
            attributes: [{attributeSearch: "name", operator:"=", attruteData:"N123"}]
          }, 
          searchString: "Auftrag: name=N123",
          color: "ffffffff"
        },{
          searchObject: {
            nodeType:"Auftrag",
            attributes: []
          },  
          searchString: "Auftrag",
          color: "abcdefaa"
      }]}
    ]
    let rules = [{
      searchObject: {
        nodeType:"Auftrag",
        attributes: [{attributeSearch: "name", operator:"=", attruteData:"N1234"}]
      }, 
      searchString: "Auftrag: name=N1234",
      color: "ffffffff"
    }]
    let type = "color"
    let nodeLabel = "Auftrag"
    UPDATE_NODE_RULESET(state, {
      rules,
      nodeLabel,
      type
    })
    expect(state.configurations.appearanceConfiguration.nodeConfiguration.color).toEqual([{
      nodeLabel: "Auftrag",
      rules:[{
        searchObject: {
          nodeType:"Auftrag",
          attributes: [{attributeSearch: "name", operator:"=", attruteData:"N123"}]
        }, 
        searchString: "Auftrag: name=N123",
        color: "ffffffff"
      },
      {
        searchObject: {
          nodeType:"Auftrag",
          attributes: [{attributeSearch: "name", operator:"=", attruteData:"N1234"}]
        }, 
        searchString: "Auftrag: name=N1234",
        color: "ffffffff"
      }]
    }])
  })

})