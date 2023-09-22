import { mutations } from "../mutations";
global.expect = require("expect");
const {
  SET_SELECTED_NODES,
  SET_SELECTION_MODAL_STATE,
  SET_SELECTED_INDEX,
  SET_TEMPORARY_SELECTED,
} = mutations;

describe("SET_SELECTED_NODES", () => {
  let state;
  beforeEach(() => {
    state = {
      selectedNodes: [],
    };
  });
  it("sets the selected nodes", () => {
    SET_SELECTED_NODES(state, [{ id: "1" }]);
    expect(state.selectedNodes).toEqual([{ id: "1" }]);
  });
});

describe("SET_SELECTION_MODAL_STATE", () => {
  let state;
  beforeEach(() => {
    state = {
      modalOpen: false,
    };
  });
  it("sets modalOpen", () => {
    SET_SELECTION_MODAL_STATE(state, true);
    expect(state.modalOpen).toEqual(true);
  });
});

describe("SET_SELECTED_INDEX", () => {
  let state;
  beforeEach(() => {
    state = {
      selectedNodeIndex: 0,
    };
  });
  it("sets selected index", () => {
    SET_SELECTED_INDEX(state, 1);
    expect(state.selectedNodeIndex).toEqual(1);
  });
});

describe("SET_TEMPORARY_SELECTED", () => {
  let state;
  beforeEach(() => {
    state = {
      temporarySelectedNodes: [],
    };
  });
  it("sets selected index", () => {
    SET_TEMPORARY_SELECTED(state, [{ id: "1" }]);
    expect(state.temporarySelectedNodes).toEqual([{ id: "1" }]);
  });
});
