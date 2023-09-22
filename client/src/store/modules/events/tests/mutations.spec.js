import { mutations } from "../mutations";

const {
  SET_GROUP_MOVE_ACTIVE,
  SET_MOVE_ORIGIN_POSITION,
  SET_AFFECTED_NODES_ORIGIN_POSITION,
  SET_MOUSE_PAUSED,
  SET_MULTI_SELECT_OVERLAY,
  SET_KEY_UP,
  SET_KEY_DOWN,
  SET_WAS_PAUSED,
  SET_GRAPH_OVERLAY_MOUSE_DOWN,
} = mutations;
global.expect = require("expect");

describe("SET_GROUP_MOVE_ACTIVE", () => {
  let state;
  beforeEach(() => {
    state = {
      groupMoveActive: false,
    };
  });
  it("sets the group move active", () => {
    SET_GROUP_MOVE_ACTIVE(state, true);
    expect(state.groupMoveActive).toEqual(true);
  });
});

describe("SET_MOVE_ORIGIN_POSITION", () => {
  let state;
  beforeEach(() => {
    state = {
      moveOriginPosition: false,
    };
  });
  it("sets the origin position for move action", () => {
    SET_MOVE_ORIGIN_POSITION(state, { x: 0, y: 10 });
    expect(state.moveOriginPosition).toEqual({ x: 0, y: 10 });
  });
});

describe("SET_AFFECTED_NODES_ORIGIN_POSITION", () => {
  let state;
  beforeEach(() => {
    state = {
      originNodePositions: [{ id: "1" }],
    };
  });
  it("sets the origin position for move action", () => {
    SET_AFFECTED_NODES_ORIGIN_POSITION(state, [{ id: "1" }, { id: "2" }]);
    expect(state.originNodePositions).toEqual([{ id: "1" }, { id: "2" }]);
  });
});

describe("SET_MOUSE_PAUSED", () => {
  let state;
  beforeEach(() => {
    state = {
      mousePaused: false,
    };
  });
  it("sets the group move active", () => {
    SET_MOUSE_PAUSED(state, true);
    expect(state.mousePaused).toEqual(true);
  });
});

describe("SET_MULTI_SELECT_OVERLAY", () => {
  let state;
  beforeEach(() => {
    state = {
      multiSelectOverlay: false,
    };
  });
  it("sets the group move active", () => {
    SET_MULTI_SELECT_OVERLAY(state, true);
    expect(state.multiSelectOverlay).toEqual(true);
  });
});

describe("SET_KEY_UP", () => {
  let state;
  beforeEach(() => {
    state = {
      keysdown: {
        123: true,
      },
    };
  });
  it("sets the group move active", () => {
    SET_KEY_UP(state, "123");
    expect(state.keysdown["123"]).toEqual(false);
  });
});

describe("SET_KEY_DOWN", () => {
  let state;
  beforeEach(() => {
    state = {
      keysdown: {
        123: false,
      },
    };
  });
  it("sets the group move active", () => {
    SET_KEY_DOWN(state, "123");
    expect(state.keysdown["123"]).toEqual(true);
  });
});

describe("SET_WAS_PAUSED", () => {
  let state;
  beforeEach(() => {
    state = {
      wasPaused: false,
    };
  });
  it("sets the group move active", () => {
    SET_WAS_PAUSED(state, true);
    expect(state.wasPaused).toEqual(true);
  });
});

describe("SET_GRAPH_OVERLAY_MOUSE_DOWN", () => {
  let state;
  beforeEach(() => {
    state = {
      graphOverlayMouseDown: false,
    };
  });
  it("sets the graph overlay active", () => {
    SET_GRAPH_OVERLAY_MOUSE_DOWN(state, true);
    expect(state.graphOverlayMouseDown).toEqual(true);
  });
});
