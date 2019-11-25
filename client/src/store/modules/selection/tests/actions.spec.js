import {
    actions
} from '../actions'
global.expect = require('expect')
import Viva from "vivagraphjs";
global._ = require("lodash")

import {getNodeUi, getAllNodes, getAllLinks, getNodePosition} from "@/assets/js/graphHelper"
jest.mock("@/assets/js/graphHelper")
const {
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
    pinNodes,
    unpinNodes,
    invertSelection,
    moveSelection
} = actions

describe("markNodes",()=>{
    let dispatch 
    let rootState
    beforeEach(()=>{
        dispatch=jest.fn()
        rootState={
            searchObject:{valid: false, errors:[], attributes:[], tip:{type:"nodeType",text:""}},
            schema:{
                collectionConnections: [{edgeTypeName: "Auftrag_hat_Auftraggeber", fromNodeTypeName:"Auftrag"}],
                edgeTypes: [{name:"Auftrag_hat_Auftraggeber"}],
                nodeTypes: [{name:"Auftrag"},{name:"Kunde"}]
            },
            mainGraph: {
                Graph: new Viva.Graph.graph(),
                renderState: {
                    Renderer: {
                        getGraphics: function (){
                            return {
                                getNodeUI: function(nodeId){
                                    return {
                                        color: "aabbccff"
                                    }
                                }
                            }
                        }
                    }
                }
              }
        }
        let nodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    label: "Auftrag"
                }
            },
            {
            id: "Auftrag/2",
                data: {
                    name: "karl",
                    label: "Auftrag"
                }
            },
            {
            id: "Kunde/1",
            data: {
                name: "franz",
                label: "Kunde"
            }
            }
        ]
        nodes.forEach(node => {
            rootState.mainGraph.Graph.addNode(node.id, node.data)
        })
    })
    it("sets the color of not selected nodes transparent",()=>{
        let foundNodes = [
            {
                id: "Auftrag/1",
                links: [],
                data: {
                    name: "bob",
                    label: "Auftrag"
                }
            },
            {
                id: "Auftrag/2",
                data: {
                    name: "karl",
                    label: "Auftrag"
                },
                links: []
            }
        ]
        markNodes({dispatch, rootState},foundNodes)
        expect(dispatch).toHaveBeenCalledWith("setNodeOpacity",{node: {id: "Kunde/1", data: { name: "franz", label: "Kunde" }, links:[]}, opacity: "44"})
    })
    it("sets the color of all found nodes to intransparent",()=>{
        let foundNodes = [
            {
                id: "Auftrag/1",
                links: [],
                data: {
                    name: "bob",
                    label: "Auftrag"
                }
            },
            {
                id: "Auftrag/2",
                data: {
                    name: "karl",
                    label: "Auftrag"
                },
                links: []
            }
        ]
        markNodes({dispatch, rootState},foundNodes)
        expect(dispatch).toHaveBeenCalledWith("setNodeOpacity",{node: {
            id: "Auftrag/1",
            links: [],
            data: {
                name: "bob",
                label: "Auftrag"
            }
        }, opacity: "ff"})
        expect(dispatch).toHaveBeenCalledWith("setNodeOpacity",{node: {
            id: "Auftrag/2",
            data: {
                name: "karl",
                label: "Auftrag"
            },
            links: []
        }, opacity: "ff"})
    })
})

describe('setSelectedNodes', ()=>{
    it('sets the selectedNodes array', ()=>{
        let commit = jest.fn()
        const nodes = [{id:"node1", data:{label:"Auftrag"}}, {id:"node2", data:{label:"Auftrag"}}]
        setSelectedNodes({commit}, nodes)
        expect(commit).toHaveBeenCalledWith("SET_SELECTED_NODES", [{id:"node1", data:{label:"Auftrag"}}, {id:"node2", data:{label:"Auftrag"}}])
    })
})

describe('handleAreaSelected', ()=>{
    let dispatch = jest.fn()
    let commit
    let rootState
    let graphics
    let nodes
    let topLeft
    let bottomRight
    let nodePos
    let area
    beforeEach(()=>{
        commit = jest.fn()
        rootState = {
            mainGraph: {
                Graph: new Viva.Graph.graph(),
                renderState: {
                    Renderer: {
                        getGraphics: jest.fn()
                    }
                }
            },
            selection: {
                temporarySelectedNodes: [],
                selectedNodes: []
            }
        }
        nodes = [
            {id: "1", data: {name:"karl"}},
            {id: "2", data: {name:"heinz"}}
        ]
        topLeft = {x: -91.93242967690891, y: 3.086346444249347}
        bottomRight = {x: -35.24307976348013, y: 73.68063124210396}
        nodePos = {x: -61.12435098964026, y: 37.50443237426515}
        area = {
            x: 781,
            y: 350,
            width: 53,
            height: 66
        }
        graphics = {
            getNodeUI: function(){
                return {
                    color: "aabbccff"
                }
            },
            transformClientToGraphCoordinates: function({x,y}){
                return (x===area.x&&y===area.y)?topLeft
                : (x===area.x+area.width&&y===area.y+area.height)?bottomRight
                : null
            }
        }
        rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue(graphics)
        getAllNodes.mockReturnValue(nodes)
        getNodeUi.mockReturnValue({color: parseInt("aabbccff",16)})
    })
    it('resets marking when first node is selected', ()=>{

        getNodeUi.mockReturnValueOnce({position: nodePos, size: 10}).mockReturnValueOnce({position: {x:0, y:0}, size:10})        
        handleAreaSelected({commit, dispatch, rootState}, {area})
        expect(dispatch).toHaveBeenCalledWith('markNodes',[nodes[0]])
    })
    it('marks nodes in the selected area', ()=>{
        rootState.selection.temporarySelectedNodes = [nodes[1]]
        getNodeUi.mockReturnValueOnce({position: nodePos, size: 10}).mockReturnValueOnce({position: {x:0, y:0}, size:10})        
        handleAreaSelected({commit, dispatch, rootState}, {area, graphics})
        expect(dispatch).toHaveBeenCalledWith('setNodeOpacity',{node: nodes[0], opacity: "ff"})
        expect(dispatch).toHaveBeenCalledWith('setNodeOpacity',{node: nodes[1], opacity: "44"})

    })
    it('adds selected nodes to temporary selection', ()=>{
        getNodeUi.mockReturnValueOnce({position: nodePos, size: 10}).mockReturnValueOnce({position: {x:0, y:0}, size:10})        

        handleAreaSelected({commit, dispatch, rootState}, {area, graphics})
        expect(commit).toHaveBeenCalledWith('SET_TEMPORARY_SELECTED', [nodes[0]])
    })
    it('doesnt do anything when no new nodes are added ' , ()=>{
        rootState.selection.temporarySelectedNodes = [nodes[0]]
        getNodeUi.mockReturnValueOnce({position: nodePos, size: 10}).mockReturnValueOnce({position: {x:0, y:0}, size:10})        

        handleAreaSelected({commit, dispatch, rootState}, {area, graphics})
        expect(commit).not.toHaveBeenCalled()
    })
    it('removes nodes from temporary selection' , ()=>{
        topLeft = {x: -91.93242967690891, y: -3.086346444249347}
        bottomRight = {x: 35.24307976348013, y: 73.68063124210396}
        nodePos = {x: -601.12435098964026, y: 37.50443237426515}
        getNodeUi.mockReturnValueOnce({position: nodePos, size: 10}).mockReturnValueOnce({position: {x:0, y:0}, size:10})        
        rootState.selection.temporarySelectedNodes = nodes
        handleAreaSelected({commit, dispatch, rootState}, {area, graphics})
        expect(commit).toHaveBeenCalledWith('SET_TEMPORARY_SELECTED', [nodes[1]])
    })
})

describe('selectionFinished', ()=>{
    let commit
    let dispatch
    let state
    let rootState
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
        state = {
            selection: {

            }
        }
        rootState = {
            selection: state,
            appearance: {
                highlight: false
            }
        }
    })
    it("deletes selection if no nodes are selected",()=>{
        state.temporarySelectedNodes = []
        selectionFinished({commit, dispatch, state, rootState},{addToSelection: false})
        expect(commit).toHaveBeenCalledWith("SET_TEMPORARY_SELECTED",[])
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes",[])
        expect(dispatch).toHaveBeenCalledWith("applyEdgeColorConfiguration")
        expect(dispatch).toHaveBeenCalledWith("applyNodeColorConfiguration")


    })
    it("sets selection to selected nodes",()=>{
        state.temporarySelectedNodes = [{"id":"a node"}]
        selectionFinished({commit, dispatch, state, rootState},{addToSelection: false})
        expect(commit).toHaveBeenCalledWith("SET_TEMPORARY_SELECTED",[])
        expect(dispatch).toHaveBeenNthCalledWith(1,"setSelectedNodes",[{"id":"a node"}])
        expect(dispatch).toHaveBeenNthCalledWith(2,"setEdgesTransparent")


    })
    it("adds selection to existing selection",()=>{
        state.temporarySelectedNodes = [{"id":"a node"}]
        state.selectedNodes = [{"id":"a different node"}]

        selectionFinished({commit, dispatch, state, rootState},{addToSelection: true})
        expect(commit).toHaveBeenCalledWith("SET_TEMPORARY_SELECTED",[])
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes",[{"id":"a different node"},{"id":"a node"}])
        expect(dispatch).toHaveBeenCalledWith("setEdgesTransparent")


    })
    it("stores the current graph colors when highlight mode is active",()=>{
        rootState.appearance.highlight = true

        state.temporarySelectedNodes = [{"id":"a node"}]
        state.selectedNodes = [{"id":"a different node"}]

        selectionFinished({commit, dispatch, state, rootState},{addToSelection: true})
        expect(dispatch).toHaveBeenCalledWith("storeColors")

    })
})

describe("setLinkOpactity",()=>{
    let rootState
    let commit
    beforeEach(()=>{
        commit = jest.fn()
    })
    it("sets link opacity",()=>{
        let getLinkUI = jest.fn()
        let getGraphics = jest.fn()
        rootState= {
            mainGraph:{
                renderState: {
                    Renderer:{
                        getGraphics,
                    }
                }
            }
        }
        getLinkUI.mockReturnValue({color: "ffffffff"})
        getGraphics.mockReturnValue({getLinkUI})
        setLinkOpacity({rootState, commit},{link:{id:"a link"}, opacity:"12"})
        expect(commit).toHaveBeenCalledWith("SET_EDGE_COLOR",{link: {id: "a link"}, color: parseInt("ffffff12",16)})
    })
})

describe("setNodeOpactity",()=>{
    let rootState
    let commit
    beforeEach(()=>{
        commit = jest.fn()
    })
    it("sets node opacity",()=>{
        let getNodeUI = jest.fn()
        let getGraphics = jest.fn()
        rootState= {
            mainGraph:{
                renderState: {
                    Renderer:{
                        getGraphics,
                    }
                }
            }
        }
        getNodeUi.mockReturnValue({color: "ffffffff"})
        getGraphics.mockReturnValue({getNodeUI})
        setNodeOpacity({rootState, commit},{node:{id:"a node"}, opacity:"12"})
        expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR",{node: "a node", color: parseInt("ffffff12",16)})
    })
})

describe('moveToNextNode', ()=>{
    let dispatch
    let commit
    let state
    beforeEach(()=>{
        dispatch = jest.fn()
        commit = jest.fn()
        state = {
            selectedNodeIndex:0,
            selectedNodes: [
                {id: "1"},
                {id: "2"}
            ]
        }
    })
    it('dispatches moveToNode and sets the new index when a next node exists', ()=>{
        moveToNextNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith('moveToNode', {id: "2"})
        expect(commit).toHaveBeenCalledWith('SET_SELECTED_INDEX', 1)
    })
    it('dispatches moveToFirstNode when the current node is the last', ()=>{
        state.selectedNodeIndex = 1
        moveToNextNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith('moveToFirstNode')
    })
})

describe('moveToPreviousNode', ()=>{
    let dispatch
    let commit
    let state
    beforeEach(()=>{
        dispatch = jest.fn()
        commit = jest.fn()
    })
    it('dispatches moveToNode and sets the new index when a next node exists', ()=>{
        state = {
            selectedNodeIndex:1,
            selectedNodes: [
                {id: "1"},
                {id: "2"}
            ]
        }
        moveToPreviousNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith('moveToNode', {id: "1"})
        expect(commit).toHaveBeenCalledWith('SET_SELECTED_INDEX', 0)
    })
    it('dispatches moveToLastNode when the current node is the last', ()=>{
        state = {
            selectedNodeIndex: 0,
            selectedNodes: [
                {id: "1"},
                {id: "2"}
            ]
        }
        moveToPreviousNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith('moveToLastNode')
    })
})

describe("moveToFirstNode", ()=>{
    let commit
    let dispatch
    let state
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
        state = {
            selectedNodes: [
                {id: "1"}
            ]
        }
    })
    it('dispatches moveToNode with first node when selectedNodes is not empty', ()=>{

        moveToFirstNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith("moveToNode", {id:"1"})
        expect(commit).toHaveBeenCalledWith("SET_SELECTED_INDEX", 0)
    })
    it('does not do anything when no node is selected', ()=>{
        state.selectedNodes = []
        moveToFirstNode({ dispatch, commit, state })
        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe("moveToLastNode", ()=>{
    let commit
    let dispatch
    let state
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
        state = {
            selectedNodes: [
                {id: "1"},
                {id: "2"}
            ]
        }
    })
    it('dispatches moveToNode with last node when selectedNodes is not empty', ()=>{
        moveToLastNode({ dispatch, commit, state })
        expect(dispatch).toHaveBeenCalledWith("moveToNode", {id:"2"})
        expect(commit).toHaveBeenCalledWith("SET_SELECTED_INDEX", 1)
    })
    it('does not do anything when no node is selected', ()=>{
        state.selectedNodes = []
        moveToLastNode({ dispatch, commit, state })
        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe("setEdgesTransparent", ()=>{
    let commit
    let rootState
    let state
    let dispatch
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
        rootState = {
            mainGraph: {
                Graph: new Viva.Graph.graph(),
                renderState: {
                    Renderer: {
                        getGraphics: function (){
                            return {
                                getLinkUI: function(linkId){
                                    return {
                                        color: "aabbccff"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        let nodes = [{
                id: "Auftrag/1",
                data: {
                    name: "bob",
                    label: "Auftrag"
                }
            },
            {
                id: "Auftrag/2",
                data: {
                    name: "karl",
                    label: "Auftrag"
                }
            },
            {
                id: "Kunde/1",
                data: {
                    name: "franz",
                    label: "Kunde"
                }
            }
        ]
        let links = [
            {from: "Auftrag/1", to: "Kunde/1"},
            {from: "Auftrag/2", to: "Kunde/1"},
        ]
        nodes.forEach(node => {
            rootState.mainGraph.Graph.addNode(node.id, node.data)
        })
        links.forEach(link=>{
            rootState.mainGraph.Graph.addLink(link.from, link.to)
        })
    })
    it("sets links transparent that have no connection to selected nodes", ()=>{
        state = {
            selectedNodes: [
                {
                    id: "Auftrag/1",
                    data: {
                        name: "bob",
                        label: "Auftrag"
                    },
                    links: [
                        {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"}
                    ]
                }
            ],
            temporarySelectedNodes: []
        }
        getAllLinks.mockReturnValueOnce([
            {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"},
            {fromId: "Auftrag/2", toId: "Kunde/1", id: "Auftrag/2👉 Kunde/1"}

        ])
        setEdgesTransparent({ commit, rootState, state, dispatch })
        expect(dispatch).toHaveBeenNthCalledWith(1, "setLinkOpacity", { link: {fromId: "Auftrag/2", toId: "Kunde/1", id: "Auftrag/2👉 Kunde/1"}, opacity: "44" })
    })
    it("sets links half-transparent that have one connection to a selected node", ()=>{
        state = {
            selectedNodes: [
                {
                    id: "Auftrag/1",
                    data: {
                        name: "bob",
                        label: "Auftrag"
                    },
                    links: [
                        {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"}
                    ]
                }
            ],
            temporarySelectedNodes: []

        }
        getAllLinks.mockReturnValueOnce([
            {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"},
            {fromId: "Auftrag/2", toId: "Kunde/1", id: "Auftrag/2👉 Kunde/1"}

        ])
        setEdgesTransparent({ commit, rootState, state, dispatch })
        expect(dispatch).toHaveBeenNthCalledWith(2, "setLinkOpacity", { link: {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"}, opacity: "88" })
    })
    it("sets linkcolor to links that have two connections to selected nodes", ()=>{
        state = {
            selectedNodes: [
                {
                    id: "Kunde/1",
                    data: {
                        name: "franz",
                        label: "Kunde"
                    },
                    links: [
                        {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"},
                        {fromId: "Auftrag/2", toId: "Kunde/1", id: "Auftrag/2👉 Kunde/1"}
                    ]
                },
                {
                    id: "Auftrag/1",
                    data: {
                        name: "bob",
                        label: "Auftrag"
                    },
                    links: [
                        {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"}
                    ]
                }
            ],
            temporarySelectedNodes: []

        }
        getAllLinks.mockReturnValueOnce([
            {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"},
            {fromId: "Auftrag/2", toId: "Kunde/1", id: "Auftrag/2👉 Kunde/1"}
        ])
        setEdgesTransparent({ commit, rootState, state, dispatch })
        expect(dispatch).toHaveBeenCalledWith("setLinkOpacity", {link: {fromId: "Auftrag/1", toId: "Kunde/1", id: "Auftrag/1👉 Kunde/1"}, opacity: "ff"})
    })
})

describe("removeSelectedNodes",()=>{
    let state
    let commit
    let dispatch
    beforeEach(()=>{
        commit = jest.fn()
        dispatch = jest.fn()
    })
    it("sets node opacity",()=>{
        state= {
            selectedNodes:[
                {id: "Node/1"},{id: "Node/2"}
            ]
        }
        removeSelectedNodes({commit, dispatch, state})
        expect(commit).toHaveBeenCalledWith("REMOVE_NODE", {id: "Node/1"})
        expect(commit).toHaveBeenCalledWith("REMOVE_NODE", {id: "Node/2"})
        expect(dispatch).toHaveBeenCalledWith("setInfo", "2 selected nodes removed")

    })
})

describe("changeSelectionModalState",()=>{
    let commit
    let state
    beforeEach(()=>{
        commit = jest.fn()
        state={
            modalOpen: false
        }
    })
    it("changes modal state",()=>{
        changeSelectionModalState({commit, state})
        expect(commit).toHaveBeenCalledWith("SET_SELECTION_MODAL_STATE", true)
    })
})

describe("expandSelectedNodes",()=>{
    let dispatch
    let state
    beforeEach(()=>{
        dispatch = jest.fn()
        state = {
            selectedNodes: [
                {id: "1"}
            ]
        }
    })
    it("calls expand action",async ()=>{
        await expandSelectedNodes({dispatch, state})
        expect(dispatch).toHaveBeenCalledWith("expandAction", {nodes: state.selectedNodes})
    })
    it("applies configuration",async ()=>{
        await expandSelectedNodes({dispatch, state})
        expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations")
    })
    it("marks selected nodes",async ()=>{
        await expandSelectedNodes({dispatch, state})
        expect(dispatch).toHaveBeenCalledWith("markNodes", state.selectedNodes)
    })
    it("sets edges transparent",async ()=>{
        await expandSelectedNodes({dispatch, state})
        expect(dispatch).toHaveBeenCalledWith("setEdgesTransparent")
    })
})

describe("collapseSelectedNodes",()=>{
    let dispatch
    let state
    beforeEach(()=>{
        dispatch = jest.fn()
        state = {
            selectedNodes: [
                {id: "1"}
            ]
        }
    })
    it("collapses selected nodes",()=>{
        collapseSelectedNodes({dispatch, state})
        expect(dispatch).toHaveBeenCalledWith("collapseAction", state.selectedNodes[0])
    })
})

describe("updateSelectionUI",()=>{
    let dispatch
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        nodes=[{id:"1"}, {id:"2"}]
    })
    it("marks nodes",()=>{
        updateSelectionUI({dispatch}, nodes)
        expect(dispatch).toHaveBeenCalledWith("markNodes", nodes)
    })
    it("sets edges transparent",()=>{
        updateSelectionUI({dispatch}, nodes)
        expect(dispatch).toHaveBeenCalledWith("setEdgesTransparent")
    })
})

describe("selectNodes",()=>{
    let dispatch
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        nodes=[{id:"1"}, {id:"2"}]
    })
    it("selects nodes",()=>{
        selectNodes({dispatch}, nodes)
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes", nodes)
    })
    it("updates UI",()=>{
        selectNodes({dispatch}, nodes)
        expect(dispatch).toHaveBeenCalledWith("updateSelectionUI", nodes)
    })
})

describe("deselect",()=>{
    let dispatch
    beforeEach(()=>{
        dispatch = jest.fn()
    })
    it("deletes sets node selection",()=>{
        deselect({dispatch})
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes", [])
    })
    it("applies color configurations",()=>{
        deselect({dispatch})
        expect(dispatch).toHaveBeenCalledWith("applyNodeColorConfiguration")
        expect(dispatch).toHaveBeenCalledWith("applyEdgeColorConfiguration")
    })
    it("informs the user",()=>{
        deselect({dispatch})
        expect(dispatch).toHaveBeenCalledWith("setInfo", "Selection removed")
    })
})

describe("selectAll",()=>{
    let dispatch
    let rootState
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        rootState = {

        }
        nodes = [{id: "1"}, {id: "2"}]
        getAllNodes.mockReturnValue(nodes)
    })
    it("selects all nodes",()=>{
        selectAll({dispatch, rootState})
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes", nodes)
    })
    it("marks all nodes",()=>{
        selectAll({dispatch, rootState})
        expect(dispatch).toHaveBeenCalledWith("markNodes", nodes)
    })
    it("informs the user",()=>{
        selectAll({dispatch, rootState})
        expect(dispatch).toHaveBeenCalledWith("setInfo", "Selected all nodes")
    })
})

describe("pinNodes",()=>{
    let dispatch
    let commit
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        commit = jest.fn()
        nodes = [{id: "1"}, {id: "2"}]
    })
    it("pins nodes",()=>{
        pinNodes({dispatch, commit}, nodes)
        expect(commit).toHaveBeenCalledWith("PIN_NODE", nodes[0])
        expect(commit).toHaveBeenCalledWith("PIN_NODE", nodes[1])

    })
    it("informs the user",()=>{
        pinNodes({dispatch, commit}, nodes)
        expect(dispatch).toHaveBeenCalledWith("setInfo", "2 nodes pinned")
    })
})

describe("unpinNodes",()=>{
    let dispatch
    let commit
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        commit = jest.fn()
        nodes = [{id: "1"}, {id: "2"}]
    })
    it("unpins nodes",()=>{
        unpinNodes({dispatch, commit}, nodes)
        expect(commit).toHaveBeenCalledWith("UNPIN_NODE", nodes[0])
        expect(commit).toHaveBeenCalledWith("UNPIN_NODE", nodes[1])

    })
    it("informs the user",()=>{
        unpinNodes({dispatch, commit}, nodes)
        expect(dispatch).toHaveBeenCalledWith("setInfo", "2 nodes released")
    })
})

describe("invertSelection",()=>{
    let dispatch
    let rootState
    let nodes
    beforeEach(()=>{
        dispatch = jest.fn()
        nodes = [{id: "1"}, {id: "2"}, {id: "3"}]
        rootState= {
            selection: {
                selectedNodes: [nodes[0]]
            }
        }
        getAllNodes.mockReturnValue(nodes)
    })
    it("inverts the selection",()=>{
        invertSelection({dispatch, rootState})
        expect(dispatch).toHaveBeenCalledWith("setSelectedNodes", [nodes[1], nodes[2]])
    })
    it("updates the colors",()=>{
        invertSelection({dispatch, rootState})
        expect(dispatch).toHaveBeenCalledWith("updateSelectionUI", [nodes[1], nodes[2]])
    })
    it("does not invert the selection when no nodes are selected",()=>{
        rootState.selection.selectedNodes = []
        invertSelection({dispatch, rootState})
        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe("moveSelection",()=>{
    let commit
    let rootState
    let nodesWithPositionToMove
    beforeEach(()=>{
        commit = jest.fn()
        nodesWithPositionToMove = [
            {node: {id: "1"}, position: {x: 10, y: 10}},
            {node: {id: "2"}, position: {x: 0, y: 10}}, 
            {node: {id: "3"}, position: {x: -10, y: 0}}]
        rootState= {}
        getNodePosition.mockReturnValue({x: 10, y: 10})
    })
    it("moves the selection",()=>{
        moveSelection({commit, rootState},{originNode: {id: "1"}, nodesWithPositionToMove, oldOriginPosition: {x: 0, y: 0}})
        expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", {nodeId: "2", xPosition: 10, yPosition: 20})
        expect(commit).toHaveBeenCalledWith("SET_NODE_POSITION", {nodeId: "3", xPosition: 0, yPosition: 10})

    })
    it("doesn't move the dragged node",()=>{
        moveSelection({commit, rootState},{originNode: {id: "1"}, nodesWithPositionToMove, oldOriginPosition: {x: 0, y: 0}})
        expect(commit).not.toHaveBeenCalledWith("SET_NODE_POSITION", {nodeId: "1", xPosition: expect.anything(), yPosition: expect.anything()})

    })
})