import Viva from "vivagraphjs";
import { getNodePosition, getPinnedState } from "@/assets/js/graphHelper";
import { startMultiSelect } from "@/assets/js/selectHelper";

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

const mouseEnterFunctionality = ({ commit, dispatch, rootState }, node) => {
  commit("SET_HOVERED_NODE", node);
  commit("SET_TOOLTIP_VISIBILITY", true);
  if (rootState.appearance.highlight) {
    dispatch("highlight", node);
  }
};
const mouseLeaveFunctionality = ({ commit, dispatch, rootState }) => {
  commit("SET_HOVERED_NODE", {
    id: 0,
    data: {},
  });
  commit("SET_TOOLTIP_VISIBILITY", false);
  if (rootState.appearance.highlight) {
    dispatch("loadColors");
  }
};
const mouseClickFunctionality = async (
  { commit, dispatch, rootState },
  node,
) => {
  commit("SET_CURRENTNODE", node);
  const activeMode = rootState.activeMode;
  if (node.data.label === "artist" || node.data.label === "album") {
    dispatch("getSongSamples", node);
  }
  dispatch("addToClickHistory", { node, action: activeMode });
  switch (activeMode) {
    case "expand":
      await dispatch("expandAction", { nodes: [node] });
      dispatch("applyAllConfigurations");
      if (node.data.label === "song") {
        dispatch("songAction", node);
      }
      break;
    case "collapse":
      dispatch("collapseAction", node);
      break;
    case "explore":
      if (node.data.label === "song") {
        dispatch("songAction", node);
      }
      break;
  }
};

const mouseMoveFunctionality = ({ rootState, commit, dispatch }, node) => {
  if (
    node &&
    rootState.selection.selectedNodes.length > 0 &&
    rootState.events.moveOriginPosition
  ) {
    if (rootState.mainGraph.renderState.isRendered) {
      commit("PAUSE_RENDERING");
    }
    dispatch("moveSelection", {
      originNode: node,
      nodesWithPositionToMove: rootState.events.originNodePositions,
      oldOriginPosition: rootState.events.moveOriginPosition,
    });
  }
};
const mouseDownFunctionality = ({ rootState, commit }, node) => {
  if (
    rootState.selection.selectedNodes.filter((n) => n.id == node.id).length == 1
  ) {
    commit("SET_MOUSE_PAUSED", !rootState.mainGraph.renderState.isRendered);
    commit(
      "SET_MOVE_ORIGIN_POSITION",
      getNodePosition({
        graphics: rootState.mainGraph.renderState.Renderer.getGraphics(),
        node,
      }),
    );
    const nodesWithPosition = rootState.selection.selectedNodes.map((node) => {
      const pos = getNodePosition({
        graphics: rootState.mainGraph.renderState.Renderer.getGraphics(),
        node,
      });
      return { node: { id: node.id }, position: { x: pos.x, y: pos.y } };
    });
    commit("SET_AFFECTED_NODES_ORIGIN_POSITION", nodesWithPosition);
  }
};

const mouseUpFunctionality = ({ rootState, commit }, node) => {
  if (
    rootState.selection.selectedNodes.filter((n) => n.id == node.id).length == 1
  ) {
    commit("SET_MOVE_ORIGIN_POSITION", undefined);
    commit("SET_AFFECTED_NODES_ORIGIN_POSITION", []);
    if (!rootState.events.mousePaused) {
      commit("RESUME_RENDERING");
    }
  }
};

const resizeGraphContainer = ({ commit }, { width, height }) => {
  commit("RESIZE_GRAPH", { width, height });
};
const changePinStatus = ({ commit, rootState }, node) => {
  if (!getPinnedState(rootState, node)) {
    commit("PIN_NODE", node);
  } else {
    commit("UNPIN_NODE", node);
  }
};

const initEvents = ({ rootState, commit, dispatch }) => {
  var graphics = rootState.mainGraph.renderState.Renderer.getGraphics();
  var events = Viva.Graph.webglInputEvents(graphics, rootState.mainGraph.Graph);
  dispatch("initSelectionEvents");

  events
    .mouseEnter(function (node) {
      dispatch("mouseEnterFunctionality", node);
    })
    .mouseLeave(function (node) {
      dispatch("mouseLeaveFunctionality");
    })
    .dblClick(function (node) {})
    .click(function (node) {
      dispatch("mouseClickFunctionality", node);
    })
    .mouseMove(function (node) {
      dispatch("mouseMoveFunctionality", node);
    })
    .mouseDown(function (node) {
      dispatch("mouseDownFunctionality", node);
    })
    .mouseUp(function (node) {
      dispatch("mouseUpFunctionality", node);
    });
};

const keyUpFunctions = ({ dispatch, commit, rootState, state }, e) => {
  if (e.which === ESC) {
    dispatch("deselect");
  } else if (e.which === DEL) {
    dispatch("removeSelectedNodes");
  } else if (e.which === C) {
    dispatch("clusterNodes");
  } else if (e.which === P) {
    dispatch("pinNodes", rootState.selection.selectedNodes);
    if (rootState.searchString === "party") {
      dispatch("clusterLoop");
    }
  } else if (e.which === U) {
    dispatch("unpinNodes", rootState.selection.selectedNodes);
  } else if (e.which === M) {
    commit("SET_GROUP_MOVE_ACTIVE", !rootState.events.groupMoveActive);
  } else if (e.which === H) {
    dispatch("toggleHighlight");
    if (rootState.appearance.highlight) {
      dispatch("storeColors");
    }
  } else if (e.which === I) {
    dispatch("invertSelection");
  } else if (state.keysdown[CTRL] && e.which === A) {
    dispatch("selectAll");
  } else if (
    (e.which === SHIFT || e.which === CTRL) &&
    state.multiSelectOverlay
  ) {
    dispatch("selectionFinished", { addToSelection: state.keysdown[CTRL] });
    document.getElementById("graphContainer").focus();
    state.multiSelectOverlay.destroy();
    commit("SET_MULTI_SELECT_OVERLAY", null);
    if (!state.wasPaused) {
      commit("RESUME_RENDERING");
    }
  }
  commit("SET_KEY_UP", e.which);
};

const keyDownFunctions = ({ rootState, commit, dispatch, state }, e) => {
  if (
    e.which === SHIFT &&
    !state.keysdown[SHIFT] &&
    !state.multiSelectOverlay
  ) {
    commit("SET_WAS_PAUSED", !rootState.mainGraph.renderState.isRendered);
    if (rootState.mainGraph.renderState.isRendered) {
      commit("PAUSE_RENDERING");
    }
    commit(
      "SET_MULTI_SELECT_OVERLAY",
      startMultiSelect({
        onAreaSelectedCallback: (area) =>
          dispatch("handleAreaSelected", { area }),
        overlayCssSelector: ".graph-overlay",
      }),
    );
  }
  if (e.which == F) {
    if (rootState.selection.selectedNodes.length > 0) {
      dispatch("fitGraphToSelection");
    } else {
      dispatch("fitGraphToScreen");
    }
    if (rootState.searchString === "fade") {
      dispatch("fadeOut");
    }
  }
  if (e.which == SPACE) {
    dispatch("switchRendering");
  }
  if (e.which == C) {
    dispatch("applyAllConfigurations");
  }
  commit("SET_KEY_DOWN", e.which);
};

const globalMouseDownFunctions = ({ dispatch, state, commit }, e) => {
  commit("SET_GRAPH_OVERLAY_MOUSE_DOWN", true);
  if (!state.keysdown[CTRL] && state.keysdown[SHIFT]) {
    dispatch("setSelectedNodes", []);
  }
};

const globalMouseUpFunctions = ({ dispatch, commit, state }, e) => {
  if (state.multiSelectOverlay && state.graphOverlayMouseDown) {
    dispatch("selectionFinished", { addToSelection: state.keysdown[CTRL] });
    document.getElementById("graphContainer").focus();
    state.multiSelectOverlay.destroy();
    commit("SET_MULTI_SELECT_OVERLAY", null);
    if (!state.wasPaused) {
      commit("RESUME_RENDERING");
    }
    commit("SET_KEY_UP", SHIFT);
  }
  commit("SET_GRAPH_OVERLAY_MOUSE_DOWN", false);
};

const initSelectionEvents = ({ dispatch }) => {
  const keyDownFunctions = (e) => {
    e.preventDefault();
    dispatch("keyDownFunctions", e);
  };

  document
    .getElementsByClassName("graph-overlay")[0]
    .addEventListener("mousedown", (e) => {
      dispatch("globalMouseDownFunctions", e);
    });
  document
    .getElementsByClassName("graph-overlay")[0]
    .addEventListener("keyup", (e) => {
      dispatch("keyUpFunctions", e);
    });

  document.addEventListener("mouseup", (e) =>
    dispatch("globalMouseUpFunctions", e),
  );
  document
    .getElementById("graphContainer")
    .addEventListener("keydown", keyDownFunctions);
  document.getElementById("graphContainer").addEventListener("keyup", (e) => {
    dispatch("keyUpFunctions", e);
  });
};

const setShowTour = ({ commit }, showTour) => {
  commit("SET_SHOW_TOUR", showTour);
};

export const actions = {
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
};

export default actions;
