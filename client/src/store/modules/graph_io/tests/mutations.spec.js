import { mutations } from "../mutations";

const { SET_STORED_GRAPH_NAMES, SET_GRAPH_URL } = mutations;
global.expect = require("expect");

describe("SET_STORED_GRAPH_NAMES", () => {
  let state;
  beforeEach(() => {
    state = {
      storedGraphNames: ["WOOB"],
    };
  });
  it("sets the stored graph names", () => {
    SET_STORED_GRAPH_NAMES(state, ["NOOB"]);
    expect(state.storedGraphNames).toEqual(["NOOB"]);
  });
});

describe("SET_GRAPH_URL", () => {
  let state;
  beforeEach(() => {
    state = {
      url: "",
    };
  });
  it("sets the stored graph names", () => {
    SET_GRAPH_URL(state, "blob://");
    expect(state.url).toEqual("blob://");
  });
});
