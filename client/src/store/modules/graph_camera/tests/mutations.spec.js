import { mutations } from "../mutations";

const { SET_NODE_LABELS, ADD_NODE_LABEL, REMOVE_NODE_LABEL } = mutations;
global.expect = require("expect");

describe("SET_NODE_LABELS", () => {
  let state;
  beforeEach(() => {
    state = {
      nodeLabels: [{ id: "WOOB" }],
    };
  });
  it("sets the stored graph names", () => {
    SET_NODE_LABELS(state, { NOOB: { id: "NOOB" } });
    expect(state.nodeLabels).toEqual({ NOOB: { id: "NOOB" } });
  });
});
describe("ADD_NODE_LABEL", () => {
  let state;
  beforeEach(() => {
    state = {
      nodeLabels: { WOOB: { id: "WOOB" } },
    };
  });
  it("sets the stored graph names", () => {
    ADD_NODE_LABEL(state, { id: "NOOB" });
    expect(state.nodeLabels).toEqual({
      WOOB: { id: "WOOB" },
      NOOB: { id: "NOOB" },
    });
  });
});
describe("REMOVE_NODE_LABEL", () => {
  let state;
  beforeEach(() => {
    state = {
      nodeLabels: { WOOB: { id: "WOOB" }, NOOB: { id: "NOOB" } },
    };
  });
  it("sets the stored graph names", () => {
    REMOVE_NODE_LABEL(state, { id: "WOOB" });
    expect(state.nodeLabels).toEqual({ NOOB: { id: "NOOB" } });
  });
});
