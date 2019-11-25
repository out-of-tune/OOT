import { mount, shallowMount } from '@vue/test-utils'
global.expect = require('expect')
import "babel-polyfill"
import Vuetify from 'vuetify'
import MusicPlayer from '../components/MusicPlayer.vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuetify)


// describe('MusicPlayer', ()=>{
//     it('loads picture of artist', ()=>{
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
//             }
//         })
//         const MP = shallowMount(MusicPlayer, { store, localVue })
        

//         const expected = "bob.png"
//         const actual = MP.find('.cover').attributes()["src"]

//         expect(actual).toBe(expected)
//     })
//     it('loads the zuck', ()=>{
//         const store = new Vuex.Store({
//             state: {
//                 mainGraph: {
//                     graphContainer: {},
//                     Graph: {},
//                     currentNode: {id:0,data:{ 
//                         label: "Genre",
//                         name: "bob"
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
//             }
//         })
//         const MP = shallowMount(MusicPlayer, { store, localVue })

//         const expected = "https://media.wired.com/photos/5b5777a34f14ad6ea775fb54/master/pass/zuck-962130580.jpg"

//         const actual = MP.find('.cover').attributes()["src"]

//         expect(actual).toBe(expected)
//     })
// })