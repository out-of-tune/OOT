import { actions } from '../actions'
global.expect = require('expect')

const {
    initGraph,
    setGraphContainer
} = actions

describe("initGraph", () => {
    let commit
    let dispatch
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
    })
    it("creates graph", () => {
      initGraph({
        commit,
        dispatch
      })
      expect(commit).toHaveBeenCalledWith("CREATE_GRAPH")
    })
    it("sets renderer", () => {
      initGraph({
        commit,
        dispatch
      })
      expect(commit).toHaveBeenCalledWith("SET_RENDERER")
    })
    it("initializes events", () => {
      initGraph({
        commit,
        dispatch
      })
  
      expect(dispatch).toHaveBeenCalledWith("initEvents")
    })
    it("starts renderer", () => {
      initGraph({
        commit,
        dispatch
      })
  
      expect(commit).toHaveBeenCalledWith("START_RENDERER")
    })
  })

  describe("setGraphContainer", () => {
    let commit = jest.fn()
    it("calls the right mutation", () => {
      const graphContainer = {
        "id": "test"
      }
      setGraphContainer({
        commit
      }, graphContainer)
      expect(commit).toHaveBeenCalledWith("SET_GRAPHCONTAINER", graphContainer)
    })
  })