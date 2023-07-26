/**
 * @jest-environment jsdom
 */

import {
    actions
} from '../actions'
global.expect = require('expect')
import 'babel-polyfill'
import GraphService from '@/store/services/GraphService'
jest.mock("@/store/services/GraphService")
import _ from "lodash"
import Viva from "vivagraphjs";
import SpotifyService from '@/store/services/SpotifyService'
jest.mock("@/store/services/SpotifyService")
import searchObjectHelper from '@/assets/js/searchObjectHelper'
jest.mock("@/assets/js/searchObjectHelper")

import {handleGraphqlTokenError, handleTokenError} from '@/assets/js/TokenHelper'
jest.mock('@/assets/js/TokenHelper')


const {
    generateSearchObject,
    startGraphQlSearch,
    startAdvancedGraphSearch,
    startSimpleGraphSearch,
    setSearchString,
    setSearchObject,
    setAdvancedOpen,
    setSearch
} = actions

describe("setSearch", ()=>{
    let commit
    let input
    let searchObject
    beforeEach(()=>{
        commit = jest.fn()
        input = "Artist: name=John"
        searchObject = {dummy: "object"}
        searchObjectHelper.generateSearchObject.mockReturnValue(searchObject)
    })
    it("sets the search string", ()=>{
        setSearch({commit}, input)
        expect(commit).toHaveBeenCalledWith("SET_SEARCH_STRING", input)
    })
    it("sets the search object", ()=>{
        setSearch({commit}, input)
        expect(commit).toHaveBeenCalledWith("SET_SEARCH_OBJECT", searchObject)
    })
})

describe("startGraphQlSearch",()=>{
    let commit 
    let rootState
    let dispatch
    beforeEach(()=>{
        commit=jest.fn()
        dispatch = jest.fn()
        rootState={
            searchObject:{valid: false, errors:[], attributes:[], tip:{type:"nodeType",text:""}},
            schema:
            {
                nodeTypes: [
                    { label: "artist", attributes: ["name", "id", "popularity", "sid", "mbid", "images"], endpoints:["graphql"] },
                    { label: "genre", attributes: ["name", "id"], endpoints:["graphql"] },
                    { label: "album", attributes: ["name", "id"], endpoints:["spotify"] },
                    { label: "song", attributes: ["name", "id"], endpoints: ["spotify"] }
                ],
                edgeTypes: [
                    {
                        label: "Genre_to_Genre",
                        inbound: { from: "genre", to: "genre", connectionName: "subgenres", endpoint: "graphQl" },
                        outbound: { from: "genre", to: "genre", connectionName: "supergenres", endpoint: "graphQl" },
                    },
                    {
                        label: "Artist_to_Genre",
                        inbound: { from: "artist", to: "genre", connectionName: "genres", endpoint: "graphQl" },
                        outbound: { from: "genre", to: "artist", connectionName: "artists", endpoint: "graphQl" },
                    },
                    {
                        label: "Album_to_Artist",
                        inbound: { from: "album", to: "artist", connectionName: "artists", endpoint: "spotify" },
                        outbound: { from: "artist", to: "album", connectionName: "albums", endpoint: "spotify" },
                    },
                    {
                        label: "Song_to_Album",
                        inbound: { from: "song", to: "album", connectionName: "albums", endpoint: "spotify" },
                        outbound: { from: "album", to: "song", connectionName: "songs", endpoint: "spotify" },
                    }
                ]
            },
            authentication:{
                loginState: false,
                accessToken: "asdklasdmkl",
                clientAuthenticationToken: ''
            }
        }
    })
    it("checks if query is valid",async ()=>{
        await startGraphQlSearch({commit, rootState, dispatch})
        expect(commit).not.toHaveBeenCalled()
    })
    it("errors when graphql returns an error",async ()=>{
        rootState.searchObject = {valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"some", operator:"=", attributeData:"garbage"}]}
        handleGraphqlTokenError.mockReturnValue(new Error())
        window.alert=jest.fn()
        await startGraphQlSearch({commit, rootState, dispatch})
        expect(commit).not.toHaveBeenCalled()
    })
    it("adds nodes from graphql endpoint ",async ()=>{
        rootState.searchObject = {valid: true, errors:[], nodeType:"artist",attributes:[{attributeSearch:"some", operator:" LIKE ", attributeData:"nice value1"}]}
        handleGraphqlTokenError.mockReturnValue({artist:[{id:"artist/1", money:33, volume:12},{id:"artist/2", money:33, volume:12}]})
        await startGraphQlSearch({commit, rootState, dispatch})
        expect(commit).toHaveBeenCalledWith("ADD_TO_GRAPH",{nodes: [{id:"artist/1", data:{label:"artist", money:33, volume:12}},{id:"artist/2", data:{label:"artist",money:33, volume:12}}], links:[]})
    })
    it("calls the graphql endpoint with the right parameters",async ()=>{
        handleGraphqlTokenError.mockReturnValue({artist:[{id:"artist/1", money:33, volume:12},{id:"artist/2", money:33, volume:12}]})
        rootState.searchObject = {valid: true, errors:[], nodeType:"artist",attributes:[{attributeSearch:"name", operator:"=", attributeData:"nice value1"}]}
        await startGraphQlSearch({commit, rootState, dispatch})
        const expectedQuery =`{artist(name:\"nice value1\"){name,id,popularity,sid,mbid,images}}`
        expect(handleGraphqlTokenError).toHaveBeenCalledWith(expect.anything(), [expectedQuery], dispatch, rootState)
    })
})

describe("startSimpleGraphSearch",()=>{
    let dispatch 
    let rootState
    let commit
    beforeEach(()=>{
        dispatch=jest.fn()
        commit=jest.fn()
        rootState={
            authentication: {
                clientAuthenticationToken: ''
            },
            searchObject:{valid: false, errors:[], attributes:[], tip:{type:"nodeType",text:""}},
            schema:{
                nodeTypes: [
                    { label: "artist", attributes: ["name", "id", "popularity", "sid", "mbid", "images"], endpoints:["graphql"] },
                    { label: "genre", attributes: ["name", "id"], endpoints:["graphql"] },
                    { label: "album", attributes: ["name", "id"], endpoints:["spotify"] },
                    { label: "song", attributes: ["name", "id"], endpoints: ["spotify"] }
                ],
                edgeTypes: [
                    {
                        label: "Genre_to_Genre",
                        inbound: { from: "genre", to: "genre", connectionName: "subgenres", endpoint: "graphQl" },
                        outbound: { from: "genre", to: "genre", connectionName: "supergenres", endpoint: "graphQl" },
                    },
                    {
                        label: "Artist_to_Genre",
                        inbound: { from: "artist", to: "genre", connectionName: "genres", endpoint: "graphQl" },
                        outbound: { from: "genre", to: "artist", connectionName: "artists", endpoint: "graphQl" },
                    },
                    {
                        label: "Album_to_Artist",
                        inbound: { from: "album", to: "artist", connectionName: "artists", endpoint: "spotify" },
                        outbound: { from: "artist", to: "album", connectionName: "albums", endpoint: "spotify" },
                    },
                    {
                        label: "Song_to_Album",
                        inbound: { from: "song", to: "album", connectionName: "albums", endpoint: "spotify" },
                        outbound: { from: "album", to: "song", connectionName: "songs", endpoint: "spotify" },
                    }
                ]
            },
            mainGraph: {
                Graph: new Viva.Graph.graph()
            },
            authentication:{
                loginState:false,
            },
            spotify:{
                accessToken: "asdklmsklm"

            }
        }
        let nodes = [{
            id: "artist/1",
                data: {
                    name: "bob",
                    label: "artist"
                }
            },
            {
            id: "artist/2",
                data: {
                    name: "karl",
                    label: "artist"
                }
            },
            {
            id: "album/1",
            data: {
                name: "franz",
                label: "album"
            }
            }
        ]
        nodes.forEach(node => {
            rootState.mainGraph.Graph.addNode(node.id, node.data)
        })
        handleGraphqlTokenError.mockReset()
        handleTokenError.mockReset()
    })
    it("selects nodes of nodeType",async ()=>{
        await startSimpleGraphSearch({commit, dispatch, rootState},{nodeType:"artist",searchString:""})
        const expectedNodes = [
            {
                id: "artist/1",
                links: [],
                data: {
                    name: "bob",
                    label: "artist"
                }
            },
            {
                id: "artist/2",
                data: {
                    name: "karl",
                    label: "artist"
                },
                links: []
            }
        ]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",expectedNodes)
    })
    it("selects all nodes if no searchString or nodeType is defined",async ()=>{
        await startSimpleGraphSearch({commit,dispatch, rootState},{nodeType:"any",searchString:""})
        const expectedNodes = [
            {
                id: "artist/1",
                links: [],
                data: {
                    name: "bob",
                    label: "artist"
                }
            },
            {
                id: "artist/2",
                data: {
                    name: "karl",
                    label: "artist"
                },
                links: []
            },
            {
                id: "album/1",
                data: {
                    name: "franz",
                    label: "album"
                },
                links: []
            }
        ]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",expectedNodes)
    })
    it("adds nodes from spotify and graphql without certain nodetype",async ()=>{
        handleGraphqlTokenError.mockReturnValue({genre:[], artist:[{id:"artist/113", name:"frank sinitra"}]})
        handleTokenError.mockReturnValue([{albums:{items:[{id:"13", name:"frank"}]},tracks:{items:[{id:"144", name:"in a lake"}]}}])
        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"any",searchString:"frank"})
        const expectedNodes = [
            {
                id: "album/13",
                data: {
                    sid:"13",
                    name: "frank",
                    label: "album"
                }
            },
            {
                id: "song/144",
                data: {
                    name: "in a lake",
                    label: "song",
                    sid: "144"
                }
            },
            {
                id: "artist/113",
                data: {
                    name: "frank sinitra",
                    label: "artist"
                }
            }
        ]
        expect(dispatch).toHaveBeenCalledWith("addToGraph",{nodes:expectedNodes, links:[]})
    })
    it("calls spotify correctly without nodetype", async ()=>{
        handleGraphqlTokenError.mockReturnValueOnce({genre:[]}).mockReturnValue({artist:[{id:"artist/113", name:"frank sinitra"}]})
        handleTokenError.mockReturnValue([{albums:{items:[{id:"13", name:"frank"}]},tracks:{items:[{id:"113", name:"frank goes fishing"}]}}])

        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"any",searchString:"frank"})
        expect(handleTokenError).toHaveBeenCalledWith(expect.anything(),["frank",["album","song"]], dispatch, rootState)
    })
    it("calls graphql correctly without nodetype", async ()=>{
        handleGraphqlTokenError.mockReturnValueOnce({genre:[]}).mockReturnValue({artist:[{id:"artist/113", name:"frank sinitra"}]})
        handleTokenError.mockReturnValue([{albums:{items:[{id:"13", name:"frank"}]},tracks:{items:[{id:"113", name:"frank goes fishing"}]}}])

        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"any",searchString:"frank"})
        expect(handleGraphqlTokenError).toHaveBeenCalledTimes(1)
    })
    it("adds and selects nodes from spotify with certain nodeType",async ()=>{
        handleGraphqlTokenError.mockReturnValue({genre:[]})
        handleTokenError.mockReturnValue([{tracks:{items:[{id:"13", name:"josef"}]}}])
        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"song",searchString:"josef"})
        const expectedNodes = [
            {
                id: "song/13",
                data: {
                    sid:"13",
                    name: "josef",
                    label: "song"
                },
                links: []
            }
        ]
        expect(dispatch).toHaveBeenNthCalledWith(4,"selectNodes",expectedNodes)
    })
    it("adds nodes from graphql with certain nodetype",async ()=>{
        handleGraphqlTokenError.mockReturnValue({artist:[{id:"artist/113", name:"frank sinitra"}]})
        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"artist",searchString:"chilliartist"})
        const expectedNodes = [
            {
                id: "artist/113",
                data: {
                    name: "frank sinitra",
                    label: "artist"
                }
            }
        ]
        expect(dispatch).toHaveBeenCalledWith("addToGraph",{nodes:expectedNodes, links:[]})
    })
    it("selects node where searchString matches id",async ()=>{
        handleGraphqlTokenError.mockReturnValue({artist:[{id:"artist/2", name:"karl"}]})
        await startSimpleGraphSearch({dispatch, rootState},{nodeType:"artist",searchString:"artist/2"})
        const expectedNodes = [
            {
                id: "artist/2",
                data: {
                    name: "karl",
                    label: "artist"
                },
                links: []
            },
            {
                id: "artist/2",
                data: {
                    name: "karl",
                    label: "artist"
                },
                links: []
            }
        ]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",expectedNodes)
    })

})


describe("startAdvancedGraphSearch",()=>{
    let dispatch
    let rootState
    beforeEach(()=>{
        dispatch=jest.fn()
        searchObjectHelper.validateSearchObject.mockReturnValue(true)
        rootState={
            searchObject:{valid: true, errors:[], nodeType:"Auftrag",attributes:[], tip:{type:"nodeType",text:""}},
            schema:{
                collectionConnections: [{edgeTypeName: "Auftrag_hat_Auftraggeber", fromNodeTypeName:"Auftrag"}],
                edgeTypes: [{name:"Auftrag_hat_Auftraggeber"}],
                nodeTypes: [{name:"Auftrag"},{name:"Kunde"}]
            },
            mainGraph: {
                Graph: new Viva.Graph.graph()
            },
            selection:{
                selectedNodes: [{
                    id: "Werk/1",
                    data: {
                        name: "Franks Bauabteilung",
                        "alias name": "frabab",
                        label: "Werk"
                    },
                    links:[]
                }]
            }
        }
        let nodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                }
            },
            {
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                }
            },
            {
            id: "Kunde/1",
            data: {
                name: "franz bek",
                age: 44,
                ph: 8,
                label: "Kunde"
                }

            },
            {
                id: "Werk/1",
                data: {
                    name: "Franks Bauabteilung",
                    "alias name": "frabab",
                    label: "Werk"
                }
            }
        ]
        nodes.forEach(node => {
            rootState.mainGraph.Graph.addNode(node.id, node.data)
        })
    })
    it("checks if query is valid",()=>{
        rootState.searchObject.valid=false
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})
        expect(dispatch).not.toHaveBeenCalled()
    })
    it("marks all nodes of certain type when no attributes are defined",()=>{
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links:[]
            },
            {
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)
    })
    it("notifies the user how many nodes were found",()=>{
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links:[]
            },
            {
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenNthCalledWith(1,"setSuccess","2 nodes found")
    })
    it("notifies the user with a info that 0 nodes were found",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"name", operator:"=", attributeData:"karl carlson el royo rochas"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links:[]
            },
            {
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenNthCalledWith(1,"setInfo","0 nodes found")
    })
    it("marks all nodes of certain type when operator = is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"name", operator:"=", attributeData:"karl carlson"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator != is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"name", operator:"!=", attributeData:"\"karl carlson\""}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links: []
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator > is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"age", operator:">", attributeData:"21"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links: []
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator >= is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"ph", operator:">=", attributeData:"7.4"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/1",
                data: {
                    name: "bob",
                    age: 23,
                    ph: 7.4,
                    label: "Auftrag"
                },
                links: []
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator < is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"age", operator:"<", attributeData:"21"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator <= is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"age", operator:"<=", attributeData:"21"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when operator LIKE is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"name", operator:" LIKE ", attributeData:"kar%"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    it("marks all nodes of certain type when search Attribute has \" \" in it",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Werk",attributes:[{attributeSearch:"alias name", operator:" LIKE ", attributeData:"frab%"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: false})

        let foundNodes = [{
            id: "Werk/1",
            data: {
                name: "Franks Bauabteilung",
                "alias name": "frabab",
                label: "Werk"
            },
            links:[]
        }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",foundNodes)

    })
    
    it("adds nodes to existing selection when flag is set",()=>{
        rootState.searchObject={valid: true, errors:[], nodeType:"Auftrag",attributes:[{attributeSearch:"name", operator:" LIKE ", attributeData:"kar%"}], tip:{type:"nodeType",text:""}}
        startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: true})

        let foundNodes = [{
            id: "Auftrag/2",
                data: {
                    name: "karl carlson",
                    age: 3,
                    ph: 2.4,
                    label: "Auftrag"
                },
                links:[]
            }]
        expect(dispatch).toHaveBeenCalledWith("selectNodes",[...foundNodes, ...rootState.selection.selectedNodes])
    })
    it("Puts out an error if parameters are not in schema",async ()=>{
        rootState.searchObject={valid: true, errors:expect.anything()}
        searchObjectHelper.validateSearchObject.mockReturnValue(false)
        await startAdvancedGraphSearch({dispatch, rootState}, {addToSelection: true})
        expect(dispatch).toHaveBeenCalledWith("setError",new Error("search parameters not in schema"))
    })
})


describe("setSearchString", ()=>{
    let commit
    let input
    beforeEach(()=>{
        commit = jest.fn()
        input = "Artist: name=12"
    })
    it("sets the search string", ()=>{
        setSearchString({commit}, input)
        expect(commit).toHaveBeenCalledWith("SET_SEARCH_STRING", input)
    })
})


describe("setSearchObject", ()=>{
    let commit
    let input
    beforeEach(()=>{
        commit = jest.fn()
        input = {searchString: "Artist: name=12"}
    })
    it("sets the search string", ()=>{
        setSearchObject({commit}, input)
        expect(commit).toHaveBeenCalledWith("SET_SEARCH_OBJECT", input)
    })
})

describe("setAdvancedOpen", ()=>{
    let commit
    let input
    beforeEach(()=>{
        commit = jest.fn()
        input = true
    })
    it("sets the search string", ()=>{
        setAdvancedOpen({commit}, input)
        expect(commit).toHaveBeenCalledWith("SET_ADVANCED_OPEN", input)
    })
})
