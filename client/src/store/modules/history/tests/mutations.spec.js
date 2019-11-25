import { mutations } from '../mutations'

const {
    SET_HISTORY_INDEX,
    SET_CHANGES,
    ADD_TO_CLICK_HISTORY
} = mutations
global.expect = require('expect')

describe("SET_HISTORY_INDEX", ()=>{
    let state 
    beforeEach(()=>{
       state = {
           historyIndex: 0
       }
    })
    it("sets the history index", ()=>{
        SET_HISTORY_INDEX(state, 32)
        expect(state.historyIndex).toEqual(32)
    })
})

describe("SET_CHANGES", ()=>{
    let state 
    beforeEach(()=>{
       state = {
           changes: []
       }
    })
    it("sets the history index", ()=>{
        SET_CHANGES(state, [{id: "A change"}])
        expect(state.changes).toEqual([{id: "A change"}])
    })
})

describe("ADD_TO_CLICK_HISTORY", ()=>{
    let state 
    beforeEach(()=>{
       state = {
           clickHistory: {
               "1":[{node: {id: "1"}}]
           }
       }
    })
    it("adds a clicked item to an already existing history item", ()=>{
        ADD_TO_CLICK_HISTORY(state, {node:{id: "1"}, data:{node: {id: "1"}, otherData: "A change"}})
        expect(state.clickHistory).toEqual({
            "1":[{node: {id: "1"}}, {node: {id: "1"}, otherData: "A change"}]
        })
    })
    it("adds a clicked item to the history", ()=>{
        ADD_TO_CLICK_HISTORY(state, {node: {id: "2"}, data:{node: {id: "2"}, otherData: "A change"}})
        expect(state.clickHistory).toEqual({
            "1": [{node: {id: "1"}}],
            "2": [{node: {id: "2"}, otherData: "A change"}]
        })
    })
})