import "../store/index.js"
import {
  createLocalVue,
  shallowMount
} from "@vue/test-utils"
global.expect = require('expect')

describe("Vuex", () => {
  it("is initialized", () => {
    expect(true).toBeTruthy()
  })
})