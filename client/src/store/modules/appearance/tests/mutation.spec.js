import { mutations } from "../mutations";
global.expect = require("expect");
const { SET_PENDING_REQUEST_COUNT, SET_COLORS, SET_HIGHLIGHT_ACTIVE } =
  mutations;

describe("SET_PENDING_REQUEST_COUNT", () => {
  let state;
  beforeEach(() => {
    state = {
      pendingRequestCount: 0,
    };
  });
  it("sets count in state", () => {
    SET_PENDING_REQUEST_COUNT(state, 12);
    expect(state.pendingRequestCount).toBe(12);
  });
});

describe("SET_COLORS", () => {
  let state;
  beforeEach(() => {
    state = {
      colors: {},
    };
  });
  it("sets colors in state", () => {
    SET_COLORS(state, { nodes: [], links: [] });
    expect(state.colors).toEqual({ nodes: [], links: [] });
  });
});

describe("SET_HIGHLIGHT_ACTIVE", () => {
  let state;
  beforeEach(() => {
    state = {
      highlight: false,
    };
  });
  it("sets colors in state", () => {
    SET_HIGHLIGHT_ACTIVE(state, true);
    expect(state.highlight).toEqual(true);
  });
});
