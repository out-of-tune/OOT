import { actions } from "../actions";
global.expect = require("expect");
import "babel-polyfill";
import { JSDOM } from "jsdom";
import { startMultiSelect } from "@/assets/js/selectHelper";
import { getNodePosition, getPinnedState } from "@/assets/js/graphHelper";
jest.mock("@/assets/js/selectHelper");
jest.mock("@/assets/js/graphHelper");

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
document.body.innerHTML =
  '<div id="graphContainer">' +
  '  <span id="username" />' +
  '  <button id="button" />' +
  "</div>";

const SHIFT = 16;
const CTRL = 17;
const ESC = 27;
const SPACE = 32;
const DEL = 46;
const A = 65;
const C = 67;
const F = 70;
const H = 72;
const I = 73;
const M = 77;
const P = 80;
const U = 85;

const {
  mouseEnterFunctionality,
  mouseLeaveFunctionality,
  mouseClickFunctionality,
  mouseMoveFunctionality,
  mouseDownFunctionality,
  mouseUpFunctionality,
  globalMouseDownFunctions,
  globalMouseUpFunctions,
  keyUpFunctions,
  keyDownFunctions,
  changePinStatus,
  initEvents,
  resizeGraphContainer,
  initSelectionEvents,
  setShowTour,
} = actions;

describe("mouseMoveFunctionality", () => {
  let commit;
  let rootState;
  let dispatch;
  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    rootState = {
      selection: {
        selectedNodes: [{ id: "1" }, { id: "2" }],
      },
      events: {
        moveOriginPosition: {
          x: 0,
          y: 0,
        },
        originNodePositions: [
          { id: "1", position: { x: 10, y: 20 } },
          { id: "2", position: { x: 20, y: 20 } },
        ],
      },
      mainGraph: {
        renderState: {
          isRendered: true,
        },
      },
    };
  });
  it("pauses rendering", () => {
    mouseMoveFunctionality({ rootState, commit, dispatch }, { id: "1" });
    expect(commit).toHaveBeenCalledWith("PAUSE_RENDERING");
  });
  it("moves the selection", () => {
    mouseMoveFunctionality({ rootState, commit, dispatch }, { id: "1" });
    expect(dispatch).toHaveBeenCalledWith("moveSelection", {
      originNode: { id: "1" },
      nodesWithPositionToMove: rootState.events.originNodePositions,
      oldOriginPosition: rootState.events.moveOriginPosition,
    });
  });
  it("does not do anything when no node is given", () => {
    mouseMoveFunctionality({ rootState, commit, dispatch }, undefined);
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("does not do anything when no selection is given", () => {
    rootState.selection.selectedNodes = [];
    mouseMoveFunctionality({ rootState, commit, dispatch }, { id: "1" });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("does not pause rendering when already paused", () => {
    rootState.mainGraph.renderState.isRendered = false;
    mouseMoveFunctionality({ rootState, commit, dispatch }, { id: "1" });
    expect(commit).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
  });
});
describe("mouseDownFunctionality", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      selection: {
        selectedNodes: [{ id: "1" }, { id: "2" }],
      },
      events: {
        moveOriginPosition: {
          x: 0,
          y: 0,
        },
        originNodePositions: [
          { id: "1", position: { x: 10, y: 20 } },
          { id: "2", position: { x: 20, y: 20 } },
        ],
      },
      mainGraph: {
        renderState: {
          Renderer: {
            getGraphics: jest.fn(),
          },
          isRendered: true,
        },
      },
    };
    getNodePosition
      .mockReturnValueOnce({ x: 10, y: 10 })
      .mockReturnValueOnce({ x: 10, y: 15 })
      .mockReturnValue({ x: 10, y: 10 });
  });
  it("does not do anything when moved node is not in selection", () => {
    mouseDownFunctionality({ rootState, commit }, { id: "3" });
    expect(commit).not.toHaveBeenCalled();
  });
  it("remembers if the graph was paused", () => {
    mouseDownFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith("SET_MOUSE_PAUSED", false);
  });
  it("sets the start position of the clicked node", () => {
    mouseDownFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith("SET_MOVE_ORIGIN_POSITION", {
      x: 10,
      y: 15,
    });
  });
  it("sets the start position of the selected nodes", () => {
    mouseDownFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith("SET_AFFECTED_NODES_ORIGIN_POSITION", [
      { node: { id: "1" }, position: { x: 10, y: 15 } },
      { node: { id: "2" }, position: { x: 10, y: 10 } },
    ]);
  });
});
describe("mouseUpFunctionality", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      selection: {
        selectedNodes: [{ id: "1" }, { id: "2" }],
      },
      events: {
        moveOriginPosition: {
          x: 0,
          y: 0,
        },
        originNodePositions: [
          { id: "1", position: { x: 10, y: 20 } },
          { id: "2", position: { x: 20, y: 20 } },
        ],
        mousePaused: false,
      },
      mainGraph: {
        renderState: {
          isRendered: true,
        },
      },
    };
    getNodePosition
      .mockReturnValueOnce({ x: 10, y: 10 })
      .mockReturnValueOnce({ x: 10, y: 15 })
      .mockReturnValue({ x: 10, y: 10 });
  });
  it("does not do anything when moved node is not in selection", () => {
    mouseUpFunctionality({ rootState, commit }, { id: "3" });
    expect(commit).not.toHaveBeenCalled();
  });
  it("unpauses, if it was unpaused before move", () => {
    mouseUpFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith("RESUME_RENDERING");
  });
  it("does not unpaus, if it was paused before move", () => {
    rootState.events.mousePaused = true;
    mouseUpFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).not.toHaveBeenCalledWith("RESUME_RENDERING");
  });
  it("resets origin position", () => {
    mouseUpFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith("SET_MOVE_ORIGIN_POSITION", undefined);
  });
  it("resets node origin positions", () => {
    mouseUpFunctionality({ rootState, commit }, { id: "2" });
    expect(commit).toHaveBeenCalledWith(
      "SET_AFFECTED_NODES_ORIGIN_POSITION",
      [],
    );
  });
});
describe("mouseEnterFunctionality", () => {
  let commit;
  let node;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
    node = {
      id: "Artist/1",
      data: {
        label: "artist",
      },
    };
    rootState = {
      appearance: {
        highlight: false,
      },
    };
  });
  it("sets hoveredNode", () => {
    mouseEnterFunctionality({ commit, rootState }, node);
    expect(commit).toHaveBeenCalledWith("SET_HOVERED_NODE", node);
  });
  it("sets tooltip visibility to true", () => {
    mouseEnterFunctionality({ commit, rootState }, node);
    expect(commit).toHaveBeenCalledWith("SET_TOOLTIP_VISIBILITY", true);
  });
});
describe("mouseLeaveFunctionality", () => {
  it("sets tooltip to invisible", () => {
    const commit = jest.fn();
    let rootState = {
      appearance: {
        highlight: false,
      },
    };
    mouseLeaveFunctionality({
      commit,
      rootState,
    });
    expect(commit).toHaveBeenCalledWith("SET_TOOLTIP_VISIBILITY", false);
  });
});
describe("mouseClickFunctionality", () => {
  let commit;
  let dispatch;
  let rootState;
  let clickedNode;
  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    rootState = {
      activeMode: "expand",
      configurations: {
        actionConfiguration: {
          expand: [
            {
              nodeType: "artist",
              edges: ["album_to_artist", "artist_to_genre"],
            },
            {
              nodeType: "genre",
              edges: ["artist_to_genre"],
            },
          ],
          collapse: [
            {
              nodeType: "artist",
              edges: ["album_to_artist", "artist_to_genre"],
            },
          ],
        },
      },
    };
    clickedNode = {
      id: "artist/123",
      data: {
        label: "artist",
        data: {},
      },
    };
  });
  it("calls expand funtion on mouse click", async () => {
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).toHaveBeenCalledWith("expandAction", {
      nodes: [clickedNode],
    });
  });
  it("applies all configuration after expand", async () => {
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
  it("calls song action when song is clicked in expand mode", async () => {
    clickedNode = {
      id: "song/123",
      data: {
        label: "song",
        data: {},
      },
    };
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).toHaveBeenCalledWith("songAction", clickedNode);
  });
  it("calls collapse function on mouse click", async () => {
    rootState.activeMode = "collapse";
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).toHaveBeenCalledWith("collapseAction", clickedNode);
  });
  it("calls an alert on mouse click", async () => {
    expect(mouseClickFunctionality).toBeDefined();
  });
  it("gets node data from album", async () => {
    clickedNode = {
      id: "album/123",
      data: {
        label: "album",
        data: {},
      },
    };
    await mouseClickFunctionality({ commit, dispatch, rootState }, clickedNode);
    expect(dispatch).toHaveBeenCalledWith("getSongSamples", clickedNode);
  });
  it("calls song action when song is clicked in explore mode", async () => {
    rootState.activeMode = "explore";
    clickedNode = {
      id: "song/123",
      data: {
        label: "song",
        data: {},
      },
    };
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).toHaveBeenCalledWith("songAction", clickedNode);
  });
  it("does nothing when !song is clicked in explore mode", async () => {
    rootState.activeMode = "explore";
    clickedNode = {
      id: "album/123",
      data: {
        label: "album",
        data: {},
      },
    };
    await mouseClickFunctionality(
      {
        commit,
        dispatch,
        rootState,
      },
      clickedNode,
    );
    expect(dispatch).not.toHaveBeenCalledWith("songAction", clickedNode);
  });
});
describe("changePinStatus", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      mainGraph: {
        renderState: {
          layout: {
            isNodePinned: jest.fn(),
          },
        },
      },
    };
  });
  it("calls PIN_NODE when a node is unpinned", () => {
    getPinnedState.mockReturnValue(false);
    changePinStatus(
      { commit, rootState },
      { id: "Werk/1", data: { label: "Werk" } },
    );
    expect(commit).toHaveBeenCalledWith("PIN_NODE", {
      id: "Werk/1",
      data: { label: "Werk" },
    });
  });
  it("calls UNPIN_NODE when a node is pinned", () => {
    getPinnedState.mockReturnValue(true);
    changePinStatus(
      { commit, rootState },
      { id: "Werk/1", data: { label: "Werk" } },
    );
    expect(commit).toHaveBeenCalledWith("UNPIN_NODE", {
      id: "Werk/1",
      data: { label: "Werk" },
    });
  });
});
describe("keyUpFunctions", () => {
  let dispatch;
  let commit;
  let rootState;
  let state;
  let e;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    state = {
      groupModeActive: false,
      graphOverlayMouseDown: true,
      keysdown: {},
    };
    rootState = {
      events: state,
      selection: {
        selectedNodes: [{ id: "1" }],
      },
      appearance: {},
    };
    e = {
      which: 1,
    };
  });
  it("deselcets all nodes when escape is pressed", () => {
    e.which = ESC;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("deselect");
  });
  it("deletes selected nodes when del is pressed", () => {
    e.which = DEL;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("removeSelectedNodes");
  });
  it("pins selected nodes when p is pressed", () => {
    e.which = P;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith(
      "pinNodes",
      rootState.selection.selectedNodes,
    );
  });
  it("unpins selected nodes when u is pressed", () => {
    e.which = U;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith(
      "unpinNodes",
      rootState.selection.selectedNodes,
    );
  });
  it("activates group mode when m is pressed", () => {
    e.which = M;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_GROUP_MOVE_ACTIVE", true);
  });
  it("toggles highlight mode when h is pressed", () => {
    e.which = H;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("toggleHighlight");
  });
  it("stores colors when highlight mdoe is activated", () => {
    e.which = H;
    rootState.appearance.highlight = true;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("storeColors");
  });
  it("inverts selection when i is pressed", () => {
    e.which = I;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("invertSelection");
  });
  it("selects all nodes when Ctrl + a is pressed", () => {
    state.keysdown[CTRL] = true;
    e.which = A;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("selectAll");
  });
  it("does not do anything if only a is pressed", () => {
    state.keysdown[CTRL] = false;
    e.which = A;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).not.toHaveBeenCalledWith("selectAll");
  });
  it("sets key up", () => {
    state.keysdown[CTRL] = false;
    e.which = A;
    keyUpFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_KEY_UP", A);
  });
});
describe("keyDownFunctions", () => {
  let dispatch;
  let commit;
  let rootState;
  let state;
  let e;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    state = {
      groupModeActive: false,
      graphOverlayMouseDown: true,
      multiSelectOverlay: false,
      keysdown: {},
    };
    rootState = {
      mainGraph: {
        renderState: {
          Renderer: {
            isRendered: false,
            getGraphics: jest.fn(),
          },
        },
      },
      events: state,
      selection: {
        selectedNodes: [{ id: "1" }],
      },
      appearance: {},
    };
    e = {
      which: 1,
    };
    startMultiSelect.mockReturnValue({ id: "1" });
  });
  it("fits graph to selection when f is pressed", () => {
    e.which = F;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("fitGraphToSelection");
  });
  it("pauses/unpauses selection when SPACE is pressed", () => {
    e.which = SPACE;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("switchRendering");
  });
  it("apllies all configurations when c is pressed", () => {
    e.which = C;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
  it("starts multi select when shift is pressed", () => {
    e.which = SHIFT;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_MULTI_SELECT_OVERLAY", {
      id: "1",
    });
  });
  it("rembers paused state when shift is pressed", () => {
    e.which = SHIFT;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_WAS_PAUSED", true);
  });
  it("sets paused state when shift is pressed", () => {
    e.which = SHIFT;
    rootState.mainGraph.renderState.isRendered = true;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("PAUSE_RENDERING");
  });
  it("sets key down", () => {
    e.which = A;
    keyDownFunctions({ dispatch, commit, rootState, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_KEY_DOWN", A);
  });
});
describe("globalMouseDownFunctions", () => {
  let dispatch;
  let commit;
  let rootState;
  let state;
  let e;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    state = {
      keysdown: {},
    };
    e = {
      which: 1,
    };
  });
  it("sets graph overlay active", () => {
    globalMouseDownFunctions({ dispatch, commit, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_GRAPH_OVERLAY_MOUSE_DOWN", true);
  });
  it("resets selection if ctrl is not pressed", () => {
    state.keysdown[SHIFT] = true;
    globalMouseDownFunctions({ dispatch, commit, state }, e);
    expect(dispatch).toHaveBeenCalledWith("setSelectedNodes", []);
  });
});
describe("globalMouseUpFunctions", () => {
  let dispatch;
  let commit;
  let rootState;
  let state;
  let e;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    state = {
      wasPaused: true,
      multiSelectOverlay: {
        destroy: jest.fn(),
      },
      graphOverlayMouseDown: true,
      keysdown: {},
    };
    e = {
      which: 1,
    };
    state.keysdown[SHIFT] = true;
  });
  it("sets graph overlay inactive", () => {
    globalMouseUpFunctions({ dispatch, commit, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_GRAPH_OVERLAY_MOUSE_DOWN", false);
  });
  it("finishes selection when shift is pressed", () => {
    state.keysdown[CTRL] = true;
    globalMouseUpFunctions({ dispatch, commit, state }, e);
    expect(dispatch).toHaveBeenCalledWith("selectionFinished", {
      addToSelection: true,
    });
  });
  it("resets the multi selection overlay", () => {
    state.keysdown[CTRL] = true;
    globalMouseUpFunctions({ dispatch, commit, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_MULTI_SELECT_OVERLAY", null);
  });
  it("unpauses if it was paused before", () => {
    state.wasPaused = false;
    globalMouseUpFunctions({ dispatch, commit, state }, e);
    expect(commit).toHaveBeenCalledWith("RESUME_RENDERING");
  });
  it("resets the shift key", () => {
    state.wasPaused = false;
    globalMouseUpFunctions({ dispatch, commit, state }, e);
    expect(commit).toHaveBeenCalledWith("SET_KEY_UP", SHIFT);
  });
});
describe("resizeGraphContainer", () => {
  let commit;
  beforeEach(() => {
    commit = jest.fn();
  });
  it("resizes graph container", () => {
    resizeGraphContainer({ commit }, { width: 100, height: 100 });
    expect(commit).toHaveBeenCalledWith("RESIZE_GRAPH", {
      width: 100,
      height: 100,
    });
  });
});
