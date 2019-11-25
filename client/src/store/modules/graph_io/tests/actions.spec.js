import {
  actions
} from '../actions'
global.expect = require('expect')
import IndexedDbService from '@/store/services/IndexedDbService'
import { getAllNodes, getAllLinks, getNodePosition,getPinnedState } from '@/assets/js/graphHelper'
jest.mock('@/assets/js/graphHelper')
jest.mock('@/store/services/IndexedDbService')
const {
  downloadGraph,
  storeGraph,
  loadGraph,
  loadGraphFromIndexedDb,
  removeGraphFromIndexedDb,
  importGraph
} = actions

describe("storeGraph", () => {
  let commit
  let rootState
  let state
  let dispatch
  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
    rootState = {
      graph_io: {
        storedGraphNames: ["MamboNo1"]
      },
      mainGraph: {
        renderState: {
          layout: {
            isNodePinned: jest.fn()
          }
        }
      }
    }
    state = rootState.graph_io
  })
  it("calls saveIndexedDb", () => {
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    getPinnedState.mockReturnValueOnce(true).mockReturnValue(false) 
    storeGraph({ rootState, dispatch, commit, state }, "abc")
    const expectedGraph = {
      nodesWithPositions:
        [{ node: { "id": "artist/1", "data": { "somedata": "some data" } }, position: { x: 123, y: 123 }, pinned: true },
        { node: { "id": "artist/2", "data": { "somedata": "some data" } }, position: { x: 12, y: 12 }, pinned: false }],
      links: [{ from: 'artist/1', to: 'artist/2' }]
    }
    expect(IndexedDbService.saveGraph).toHaveBeenCalledWith("abc", expectedGraph)
  })
  it("adds name to stored graph name list if it is not there yet", () => {
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getPinnedState.mockReturnValueOnce(true).mockReturnValue(false)
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    storeGraph({ rootState, dispatch, commit, state }, "abc")
    expect(commit).toHaveBeenCalledWith("SET_STORED_GRAPH_NAMES", ["MamboNo1", "abc"])
  })
  it("doesn't add name if string already exists", () => {
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    getPinnedState.mockReturnValueOnce(true).mockReturnValue(false)
    storeGraph({ rootState, dispatch, commit, state }, "MamboNo1")
    expect(commit).toHaveBeenCalledWith("SET_STORED_GRAPH_NAMES", ["MamboNo1"])
  })
  it("dispatches success message", () => {
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    getPinnedState.mockReturnValueOnce(true).mockReturnValue(false)
    storeGraph({ rootState, dispatch, commit, state }, "MamboNo1")
    expect(dispatch).toHaveBeenCalledWith("setSuccess", expect.anything())
  })
  it("dispatches an error message when IndexedDb errors", () => {
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    getPinnedState.mockReturnValueOnce(true).mockReturnValue(false)
    IndexedDbService.saveGraph.mockImplementationOnce(new Error("A error"))
    storeGraph({ rootState, dispatch, commit, state }, "MamboNo1")
    expect(dispatch).toHaveBeenCalledWith("setError", expect.anything())
  })
})
describe("loadGraph", () => {
  let commit
  let dispatch
  let graph
  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
    graph = {
      "nodesWithPositions": [
        {
          "node": {
            "id": "progressive uplifting trance",
            "links": null,
            "data": {
              "SearchName": "progressive uplifting trance",
              "label": "Genre"
            }
          },
          "position": {
            x: 123,
            y: 122
          },
          "pinned": true
        }
      ],
      "links": [{
        "fromId": "jazz",
        "toId": "electro jazz",
        "id": "jazz👉 electro jazz"
      }
      ]
    }
  })
  it("errors when graph object is undefined", () => {
    loadGraph({
      commit,
      dispatch
    }, undefined)

    expect(dispatch).toHaveBeenCalledWith("setError", expect.anything())
  })
  it("pins the nodes", () => {

    loadGraph({ commit, dispatch }, graph)
    expect(commit).toHaveBeenCalledWith("PIN_NODE", graph.nodesWithPositions[0].node)
  })
  it("clears graph before adding nodes", () => {
    loadGraph({
      commit,
      dispatch
    }, graph)

    expect(commit).toHaveBeenCalledWith("CLEAR_GRAPH")
  }, { graph })
  it("adds the loaded graph", () => {

    loadGraph({
      commit, dispatch
    }, graph)
    expect(commit).toHaveBeenNthCalledWith(2, "ADD_TO_GRAPH", {
      nodes: [graph.nodesWithPositions[0].node],
      links: graph.links
    })
  })
  it("sets the position of the nodes", () => {

    loadGraph({
      commit, dispatch
    }, graph)
    expect(commit).toHaveBeenNthCalledWith(3, "SET_NODE_POSITION", {
      nodeId: graph.nodesWithPositions[0].node.id,
      xPosition: graph.nodesWithPositions[0].position.x,
      yPosition: graph.nodesWithPositions[0].position.y
    })
  })
})
describe("downloadGraph", () => {
  let commit
  let rootState
  beforeEach(() => {
    commit = jest.fn()
    rootState = {
      mainGraph: {
        renderState: {
          layout: {
            isNodePinned: jest.fn()
          }
        }
      }
    }
  })
  it("sets the download URL", () => {
    rootState.mainGraph.renderState.layout.isNodePinned.mockReturnValueOnce(true).mockReturnValue(false)
    getAllNodes.mockReturnValueOnce([{ "id": "artist/1", "data": { "somedata": "some data" } }, { "id": "artist/2", "data": { "somedata": "some data" } }])
    getAllLinks.mockReturnValueOnce([{ "from": "artist/1", "to": "artist/2" }])
    getNodePosition.mockReturnValueOnce({ x: 123, y: 123 }).mockReturnValueOnce({ x: 12, y: 12 })
    global.URL.createObjectURL = jest.fn();
    global.URL.createObjectURL.mockReturnValue("blob://out-of-tune.org/123123123123")
    downloadGraph({ commit, rootState })
    expect(commit).toHaveBeenCalledWith("SET_GRAPH_URL", "blob://out-of-tune.org/123123123123")
  })
})

describe("loadGraphFromIndexedDb", () => {
  let dispatch
  beforeEach(() => {
    dispatch = jest.fn()
  })
  it(("calls indexedDbWith correct name"), async () => {
    IndexedDbService.getGraph = jest.fn()
    IndexedDbService.getGraph.mockReturnValue("A graph")
    await loadGraphFromIndexedDb({ dispatch }, "graph1")
    expect(IndexedDbService.getGraph).toHaveBeenCalledWith("graph1")
  })
  it(("calls loadGraph"), async () => {
    IndexedDbService.getGraph = jest.fn()
    IndexedDbService.getGraph.mockReturnValue({ id: "A graph" })
    await loadGraphFromIndexedDb({ dispatch }, "graph1")
    expect(dispatch).toHaveBeenCalledWith("loadGraph", { id: "A graph" })
  })
  it(("sets success message"), async () => {
    IndexedDbService.getGraph = jest.fn()
    IndexedDbService.getGraph.mockReturnValue({ id: "A graph" })
    await loadGraphFromIndexedDb({ dispatch }, "graph1")
    expect(dispatch).toHaveBeenCalledWith('setSuccess', 'Graph loaded')
  })
  it(("sets error message when IndexedDb errors"), async () => {
    IndexedDbService.getGraph = jest.fn()
    IndexedDbService.getGraph.mockImplementationOnce(new Error("An error occured"))
    await loadGraphFromIndexedDb({ dispatch }, "graph1")
    expect(dispatch).toHaveBeenCalledWith('setError', new Error("An error occured"))
  })
})

describe("removeGraphFromIndexedDb", () => {
  let dispatch
  let commit
  let state
  beforeEach(() => {
    dispatch = jest.fn()
    commit = jest.fn()
    state = {
      storedGraphNames: [
        "GraphNo1",
        "MamboNo2"
      ]
    }
  })
  it(("calls indexedDbWith correct name"), async () => {
    IndexedDbService.deleteGraph = jest.fn()
    await removeGraphFromIndexedDb({ dispatch, commit, state }, "MamboNo2")
    expect(IndexedDbService.deleteGraph).toHaveBeenCalledWith("MamboNo2")
  })
  it(("sets new graph names"), async () => {
    IndexedDbService.deleteGraph = jest.fn()
    await removeGraphFromIndexedDb({ dispatch, commit, state }, "MamboNo2")
    expect(commit).toHaveBeenCalledWith("SET_STORED_GRAPH_NAMES", ["GraphNo1"])
  })
  it(("sets success message"), async () => {
    IndexedDbService.deleteGraph = jest.fn()
    await removeGraphFromIndexedDb({ dispatch, commit, state }, "MamboNo2")
    expect(dispatch).toHaveBeenCalledWith("setSuccess", "Graph deleted")
  })
  it(("sets error message when IndexedDb errors"), async () => {
    IndexedDbService.deleteGraph = jest.fn()
    IndexedDbService.deleteGraph.mockImplementationOnce(new Error("An error occured"))
    await removeGraphFromIndexedDb({ dispatch, commit, state }, "MamboNo2")
    expect(dispatch).toHaveBeenCalledWith('setError', new Error("An error occured"))
  })
})


describe("importGraph", () => {
  let dispatch
  let graph
  beforeEach(() => {
    dispatch = jest.fn()
    graph = { "nodesWithPositions": [
      { "node": { "id": "Genre/20", "data": { "name": "progressive uplifting trance", "label": "genre" } }, "position": { "x": -1107.951417718828, "y": -1420.140698533312 }, pinned: true }, 
      { "node": { "id": "Genre/137355", "data": { "name": "trance", "label": "genre" } }, "position": { "x": -742.4785465977526, "y": -1174.8853946285542 }, pinned: false }, 
      { "node": { "id": "Genre/184130", "data": { "name": "children's choir", "label": "genre" } }, "position": { "x": -743.4704301191892, "y": -1219.5796207330839 }, pinned: true }], "links": [{ "fromId": "Genre/137355", "toId": "Genre/20", "id": "Genre/137355👉 Genre/20", "linkTypes": ["Genre_to_Genre"] }] }
  })
  it("loads valid graph file",()=>{
    importGraph({dispatch}, JSON.stringify(graph))
    expect(dispatch).toHaveBeenCalledWith("loadGraph", graph)
  })
  it("sets success message",()=>{
    importGraph({dispatch}, JSON.stringify(graph))
    expect(dispatch).toHaveBeenCalledWith("setSuccess","Loaded graph successfully")
  })
  it("Errors when json is wrong",()=>{
    graph = {name: "I AM A WRONG GRAPH"}
    importGraph({dispatch}, JSON.stringify(graph))
    expect(dispatch).toHaveBeenCalledWith("setError",expect.anything())
  })
  it("Errors when a wrong file format is supplied",()=>{
    graph = "<xml>I am no Json</xml>"
    importGraph({dispatch}, graph)
    expect(dispatch).toHaveBeenCalledWith("setError",expect.anything())
  })
})