
import {getAllNodes, getNodePosition} from "@/assets/js/graphHelper.js"
import {
    actions
} from '../actions'
global.expect = require('expect')
import {JSDOM} from "jsdom"
jest.mock("@/assets/js/graphHelper.js")

const {
    moveToNode,
    fitGraphToScreen,
    fitGraphToSelection,
    fitGraphToNodes,
    removeNodeLabels,
    setNodeLabels,
    placeNodeLabel
} = actions

describe('moveToNode', ()=>{
    it('commits MOVE_TO with node position', ()=>{
        let rootState = {
            mainGraph: {
                renderState: {
                    layout: {
                        getNodePosition: nodeId => (nodeId==="1"?{x:10, y:10}: null)
                    }
                }
            }
        }
        let node = {
            id: "1",
            data: {}
        }
        let commit = jest.fn()
        moveToNode({ commit, rootState }, node)
        expect(commit).toHaveBeenCalledWith('MOVE_TO', {x:10, y:10})
    })
})

describe("fitGraphToScreen",()=>{
    let rootState
    let dispatch
    beforeEach(()=>{
        dispatch = jest.fn()
        rootState ={
            mainGraph:{
                renderState:{
                    layout:{
                        getGraphRect: jest.fn()
                    },
                    Renderer: {
                        getGraphics: jest.fn()
                    }
                }
            }
        }
    })
    it("calls fitGraphToNodes with all nodes",()=>{
        getAllNodes.mockReturnValueOnce([{id:"Node/1"},{id: "Node/2"}])
        fitGraphToScreen({rootState, dispatch})
        expect(dispatch).toHaveBeenCalledWith("fitGraphToNodes", [{id:"Node/1"},{id: "Node/2"}])
    })

})

describe("fitGraphToSelection",()=>{
    let rootState
    let commit
    let dispatch

    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
        rootState ={
            selection: {
                selectedNodes: {
                    map: jest.fn(),
                    length: 2
                }
            }
        }
    })

    it("dispatches fit to screen when no nodes are selected",()=>{
        rootState.selection.selectedNodes.length=0

        fitGraphToSelection({commit, rootState, dispatch})
        expect(dispatch).toHaveBeenCalledWith("fitGraphToScreen")
    })
    it("dispatches fit to node",()=>{

        fitGraphToSelection({rootState, dispatch})
        expect(dispatch).toHaveBeenCalledWith("fitGraphToNodes", rootState.selection.selectedNodes)
    })
})

describe("removeNodeLabels",()=>{
    let dispatch
    let rootState
    beforeEach(()=>{
        dispatch = jest.fn()
        rootState = {
            mainGraph: {
                renderState: {
                    Renderer: {
                        getGraphics: jest.fn()
                    }
                }
            }
        }
    })
    it("sets nodeLabels to empty object",()=>{
        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
            placeNode: jest.fn()
        })
        removeNodeLabels({rootState, dispatch})
        expect(dispatch).toHaveBeenCalledWith("setNodeLabels", {})
    })
    it("deletes placeNode callback",()=>{
        let placeNode = jest.fn()
        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
            placeNode
        })
        removeNodeLabels({rootState, dispatch})
        expect(placeNode).toHaveBeenCalledWith(expect.any(Function))
    })
})
describe("setNodeLabels",()=>{
    let commit
    beforeEach(()=>{
        commit = jest.fn()
    })
    it("commits SET_NODE_LABELS",()=>{
        setNodeLabels({commit},{"id": "123"})
        expect(commit).toHaveBeenCalledWith("SET_NODE_LABELS", {"id": "123"})
    })
})

describe("placeNodeLabels",()=>{
    let commit
    let rootState
    beforeEach(()=>{
        commit = jest.fn()
        rootState = {
            mainGraph: {
                renderState: {
                    Renderer: {
                        getGraphics: jest.fn()
                    }
                }
            },
            graph_camera: {
                nodeLabels: {}
            }
        }
    })
    it("doesn't do anything when node label doesn't exist",()=>{
        const transformClientToGraphCoordinates = jest.fn()
        transformClientToGraphCoordinates.mockReturnValueOnce({x: 100, y: 100})
                                         .mockReturnValueOnce({x: 1000, y: 1000})
        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
            transformClientToGraphCoordinates
        })
        const ui = {node:{id:"Genre/123"}}
        placeNodeLabel({x:1, y:1,},ui,rootState,commit)
        expect(commit).not.toHaveBeenCalled()
    })
    it("deletes nodeLabel when it exists",()=>{
        const transformClientToGraphCoordinates = jest.fn()
        transformClientToGraphCoordinates.mockReturnValueOnce({x: 100, y: 100})
                                         .mockReturnValueOnce({x: 1000, y: 1000})
        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
            transformClientToGraphCoordinates
        })
        rootState.graph_camera.nodeLabels["Genre/123"]={
            id: "Genre/123",
            data: "someData"
        }
        const ui = {node:{id:"Genre/123"}}
        placeNodeLabel({x:20, y:20,},ui,rootState,commit)
        expect(commit).toHaveBeenCalledWith("REMOVE_NODE_LABEL",{
            id: "Genre/123",
            data: "someData"
        })
    })
    it("adds label when node is on screen", ()=>{
        const transformClientToGraphCoordinates = jest.fn()
        const transformGraphToClientCoordinates = jest.fn()
        transformClientToGraphCoordinates.mockReturnValueOnce({x: 100, y: 100})
                                         .mockReturnValueOnce({x: 1000, y: 1000})
        transformGraphToClientCoordinates.mockReturnValueOnce({x: 150, y: 150})

        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
            transformClientToGraphCoordinates,
            transformGraphToClientCoordinates
        })
        const ui = {
            node:{
                id:"Genre/125",
                data: {
                    name: "someData"
                }
            },
            color: Number.parseInt("ffffffff",16),
        }
        placeNodeLabel({x:200, y:200,},ui,rootState,commit)
        expect(commit).toHaveBeenCalledWith("ADD_NODE_LABEL", {
            colors: {
                backgroundColor: "#ffffffff",
                textColor: "black"
            },
            coordinates: {
                x: 150,
                y: 150
            },
            dataKey: "name",
            id:"Genre/125",
            data: {
                name: "someData"
            }
        })
    })
})

describe("fitGraphToNodes",()=>{
    let rootState
    let commit
    beforeEach(()=>{
        commit = jest.fn()
        rootState= {

        }
        getNodePosition.mockClear()
    })
    it("does nothing when no nodes are in the call",()=>{
        fitGraphToNodes({commit, rootState}, [])
        expect(commit).not.toHaveBeenCalled()
    })
    it("centers graph",()=>{
        getNodePosition.mockReturnValueOnce({x:200, y: 200}).mockReturnValue({x:100, y: 100})
        

        const dom = new JSDOM()
        global.document = dom.window.document
        global.window = dom.window
        global.body = dom.window.document.body

        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientWidth', {value: 1000, configurable:true});
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientHeight', {value: 1000, configurable:true});

        fitGraphToNodes({commit, rootState},[{id: 1}, {id: 2}, {id:3}])
        expect(commit).toHaveBeenNthCalledWith(1, "MOVE_TO", {x:150, y: 150})

    })
    it("zooms to scale 2 when only one node is given",()=>{
        getNodePosition.mockReturnValue({x:100, y: 100})
              
        const dom = new JSDOM()
        global.document = dom.window.document
        global.window = dom.window
        global.body = dom.window.document.body

        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientWidth', {value: 500, configurable:true});
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientHeight', {value: 500, configurable:true});
        
        fitGraphToNodes({commit, rootState}, [{id:1}])

        expect(commit).toHaveBeenNthCalledWith(2, "ZOOM_TO_SCALE", 2)

    })
    it("zooms to desired scale",()=>{
        getNodePosition.mockReturnValueOnce({x:100, y: 100})
        getNodePosition.mockReturnValueOnce({x:700, y: 700})   
            
        const dom = new JSDOM()
        global.document = dom.window.document
        global.window = dom.window
        global.body = dom.window.document.body
 
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientWidth', {value: 500, configurable:true});
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientHeight', {value: 500, configurable:true});
        
        var graphSize = 600
        var screenSize = 500
        var desiredScale = screenSize / graphSize;

        fitGraphToNodes({commit, rootState}, [{id:"Node/1"},{id: "Node/2"}])

        expect(commit).toHaveBeenNthCalledWith(2, "ZOOM_TO_SCALE", desiredScale-desiredScale/4)

    })
    it("zooms to desired scale, but no more than 2",()=>{
        getNodePosition.mockReturnValueOnce({x:100, y: 100})
        getNodePosition.mockReturnValueOnce({x:150, y: 150})   
        const dom = new JSDOM()
        global.document = dom.window.document
        global.window = dom.window
        global.body = dom.window.document.body
 
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientWidth', {value: 500, configurable:true});
        Object.defineProperty(global.window.HTMLBodyElement.prototype, 'clientHeight', {value: 500, configurable:true});
        
        var graphSize = 600
        var screenSize = 500
        var desiredScale = screenSize / graphSize;

        fitGraphToNodes({commit, rootState},[{id:"Node/1"},{id: "Node/2"}])

        expect(commit).toHaveBeenNthCalledWith(2, "ZOOM_TO_SCALE", 2)

    })
    it("moves to 0 and sets zoom level to 2 when graph size is 0",()=>{
        getAllNodes.mockReturnValue([{id:"Node/1"},{id: "Node/2"}])
        getNodePosition.mockReturnValueOnce({x:0, y: 0})
        getNodePosition.mockReturnValueOnce({x:0, y: 0}) 
        fitGraphToNodes({commit, rootState},[{id:"Node/1"},{id: "Node/2"}])
        expect(commit).toHaveBeenCalledWith("ZOOM_TO_SCALE",2)
        expect(commit).toHaveBeenCalledWith("MOVE_TO",{x:0, y:0})

    })
})