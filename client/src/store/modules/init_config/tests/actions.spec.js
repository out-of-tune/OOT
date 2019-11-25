import actions from '../actions'
import 'babel-polyfill'
global.expect = require('expect')
const {
    initConfiguration
} = actions
describe("initConfiguration", () => {
    let commit
    let rootState
    beforeEach(() => {
        commit = jest.fn()
        rootState = {
            schema:{
                nodeTypes: [],
                edgeTypes: []
            }
        }
    })
    it("calls SET_COFIGURATION", () => {
        initConfiguration({
            commit, 
            rootState
        })

        expect(commit).toHaveBeenCalledWith("SET_CONFIGURATION", expect.anything())
    })
})