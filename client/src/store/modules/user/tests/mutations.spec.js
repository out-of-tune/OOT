import {
    mutations
} from '../mutations'
global.expect = require('expect')
const {
    SET_CURRENT_USER
} = mutations

describe("SET_CURRENT_USER", ()=>{
    let state 
    beforeEach(()=>{
       state = {
           me : ""
       }
    })
    it("sets the message", ()=>{
        SET_CURRENT_USER(state, "dummy")
        expect(state.me).toEqual("dummy")
    })
})

