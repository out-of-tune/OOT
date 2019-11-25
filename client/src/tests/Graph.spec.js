import { mount, shallowMount } from '@vue/test-utils'
global.expect = require('expect')
import "babel-polyfill"
import Vuetify from 'vuetify'
import Graph from '../components/Graph.vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { JestEnvironment } from '@jest/environment';
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuetify)

// describe('Graph', ()=>{
//     it('renders tooltip', ()=>{
//         const store = new Vuex.Store({
//             state: {
//                 mainGraph: {
//                     graphContainer: {},
//                     Graph: {},
//                     currentNode: {id:0,data:{ 
//                         label: "Artist",
//                         name: "bob", 
//                         ArtistInfo: [{ image_url: "bob.png" }]
//                     }},
//                     hoveredNode: {id:0,data:{}},
//                     displayState: {
//                         displayEdges: true,
//                         showTooltip: false
//                     },
//                     renderState: {
//                         Renderer: {},
//                         isRendered: true,
//                         layoutOptions: {
//                             springLength: 5, 
//                             springCoeff: 0.00005, 
//                             dragCoeff: 0.01, 
//                             gravity: -10.2
//                         }
//                     }
//                 },
//                 queue: [],
//                 SearchQuery: "",
//             },
//             actions: {
//                 setGraphContainer: jest.fn(),
//                 initGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 loadGraph: jest.fn(),
//                 storeGraph: jest.fn(),
//                 deleteGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 switchRendering: jest.fn(),
//                 toggleEdges: jest.fn(),
//                 clusterNodes: jest.fn()
//             }
//         })
//         const g = shallowMount(Graph, { store, localVue })
//         expect(g.find('#tooltip').exists()).toBeTruthy()
//     })
//     it('shows tooltip when showTooltip is true', ()=>{
//         const store = new Vuex.Store({
//             state: {
//                 mainGraph: {
//                     graphContainer: {},
//                     Graph: {},
//                     currentNode: {id:0,data:{ 
//                         label: "Artist",
//                         name: "bob", 
//                         ArtistInfo: [{ image_url: "bob.png" }]
//                     }},
//                     hoveredNode: {id:0,data:{}},
//                     displayState: {
//                         displayEdges: true,
//                         showTooltip: true
//                     },
//                     renderState: {
//                         Renderer: {},
//                         isRendered: true,
//                         layoutOptions: {
//                             springLength: 5, 
//                             springCoeff: 0.00005, 
//                             dragCoeff: 0.01, 
//                             gravity: -10.2
//                         }
//                     }
//                 },
//                 queue: [],
//                 SearchQuery: "",
//             },
//             actions: {
//                 setGraphContainer: jest.fn(),
//                 initGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 loadGraph: jest.fn(),
//                 storeGraph: jest.fn(),
//                 deleteGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 switchRendering: jest.fn(),
//                 toggleEdges: jest.fn(),
//                 clusterNodes: jest.fn()
//             }
//         })
//         const g = shallowMount(Graph, { store, localVue })
//         expect(g.find('#tooltip').isVisible()).toBeTruthy()
//     })
//     it('does not show tooltip when showTooltip is false', ()=>{
//         const store = new Vuex.Store({
//             state: {
//                 mainGraph: {
//                     graphContainer: {},
//                     Graph: {},
//                     currentNode: {id:0,data:{ 
//                         label: "Artist",
//                         name: "bob", 
//                         ArtistInfo: [{ image_url: "bob.png" }]
//                     }},
//                     hoveredNode: {id:0,data:{}},
//                     displayState: {
//                         displayEdges: true,
//                         showTooltip: false
//                     },
//                     renderState: {
//                         Renderer: {},
//                         isRendered: true,
//                         layoutOptions: {
//                             springLength: 5, 
//                             springCoeff: 0.00005, 
//                             dragCoeff: 0.01, 
//                             gravity: -10.2
//                         }
//                     }
//                 },
//                 queue: [],
//                 SearchQuery: "",
//             },
//             actions: {
//                 setGraphContainer: jest.fn(),
//                 initGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 loadGraph: jest.fn(),
//                 storeGraph: jest.fn(),
//                 deleteGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 switchRendering: jest.fn(),
//                 toggleEdges: jest.fn(),
//                 clusterNodes: jest.fn()
//             }
//         })
//         const g = shallowMount(Graph, { store, localVue })
//         expect(g.find('#tooltip').isVisible()).toBe(false)
//     })
//     it('updates the tooltip position', ()=>{
//         const store = new Vuex.Store({
//             state: {
//                 mainGraph: {
//                     graphContainer: {},
//                     Graph: {},
//                     currentNode: {id:0,data:{ 
//                         label: "Artist",
//                         name: "bob", 
//                         ArtistInfo: [{ image_url: "bob.png" }]
//                     }},
//                     hoveredNode: {id:0,data:{}},
//                     displayState: {
//                         displayEdges: true,
//                         showTooltip: true
//                     },
//                     renderState: {
//                         Renderer: {},
//                         isRendered: true,
//                         layoutOptions: {
//                             springLength: 5, 
//                             springCoeff: 0.00005, 
//                             dragCoeff: 0.01, 
//                             gravity: -10.2
//                         }
//                     }
//                 },
//                 queue: [],
//                 SearchQuery: "",
//             },
//             actions: {
//                 setGraphContainer: jest.fn(),
//                 initGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 loadGraph: jest.fn(),
//                 storeGraph: jest.fn(),
//                 deleteGraph: jest.fn(),
//                 getSupergenresToSubGenres: jest.fn(),
//                 switchRendering: jest.fn(),
//                 toggleEdges: jest.fn(),
//                 clusterNodes: jest.fn()
//             }
//         })
        
//         const event = {
//             pageX: 50,
//             pageY: 50
//         }
//         const g = shallowMount(Graph, { store, localVue })

//         const tooltip = g.find('#tooltip')
        

//         g.vm.UpdateTooltips(event)
        
//         const expected = "top: 70px; left: 70px;"
        
//         const actual = tooltip.attributes().style

//         expect(actual).toBe(expected)
//     })
    
// })