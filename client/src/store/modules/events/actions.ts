import type { ActionTree, Commit, Dispatch } from "vuex";
import { getNodePosition } from "@/lib/graph";
import { startMultiSelect } from "@/lib/select";
import type { GraphNode } from "@/types/graph";
import type { ActiveMode, Context, NodeRef, RootState } from "@/store/types";
import { ACTIVE_MODES } from "../modes";
import type { EventsState } from "./index";

type Ctx = Context<EventsState>;

/** Key codes of the keyboard shortcuts. The Help page lists them. */
export const KEY = {
  SHIFT: 16,
  CTRL: 17,
  ESC: 27,
  SPACE: 32,
  DEL: 46,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  A: 65,
  C: 67,
  F: 70,
  H: 72,
  I: 73,
  M: 77,
  P: 80,
  U: 85,
} as const;

/** Key code of 1 on the number pad. */
const NUMPAD_ONE = 97;

/** The click mode of a number key (1 to 4, also on the number pad), or undefined. */
function modeOfKey(key: number) {
  const index =
    key >= KEY.ONE && key <= KEY.FOUR
      ? key - KEY.ONE
      : key >= NUMPAD_ONE && key < NUMPAD_ONE + ACTIVE_MODES.length
        ? key - NUMPAD_ONE
        : -1;
  return ACTIVE_MODES[index];
}

/** The key code of a keyboard event. */
type KeyEvent = Pick<KeyboardEvent, "which"> &
  Partial<Pick<KeyboardEvent, "preventDefault">>;

const GRAPH_CONTAINER_ID = "graphContainer";
const GRAPH_OVERLAY_CLASS = "graph-overlay";

const isSelected = (rootState: RootState, node: GraphNode) =>
  rootState.selection.selectedNodes.some((selected) => selected.id === node.id);

/** Ends a rectangle selection: applies it, removes the overlay and resumes the layout. */
function finishMultiSelect(
  state: EventsState,
  commit: Commit,
  dispatch: Dispatch,
) {
  dispatch("selectionFinished", { addToSelection: state.keysdown[KEY.CTRL] });
  document.getElementById(GRAPH_CONTAINER_ID)?.focus();
  state.multiSelectOverlay?.destroy();
  commit("SET_MULTI_SELECT_OVERLAY", null);
  if (!state.wasPaused) commit("RESUME_RENDERING");
}

/** Shows the node in the info panel, loads the songs of an artist or album, and records the click. */
function showClickedNode(
  commit: Commit,
  dispatch: Dispatch,
  node: NodeRef,
  action: ActiveMode,
) {
  commit("SET_CURRENTNODE", node);
  if (node.data.label === "artist" || node.data.label === "album")
    dispatch("getSongSamples", node);
  dispatch("addToClickHistory", { node, action });
}

async function expandNode(dispatch: Dispatch, node: NodeRef) {
  await dispatch("expandAction", { nodes: [node] });
  dispatch("applyAllConfigurations");
}

/** Removes the DOM listeners of the previous `initSelectionEvents` call. */
let removeSelectionListeners: (() => void) | undefined;

export const actions = {
  mouseEnterFunctionality(
    { commit, dispatch, rootState }: Ctx,
    node: GraphNode,
  ) {
    commit("SET_HOVERED_NODE", node);
    commit("SET_TOOLTIP_VISIBILITY", true);
    if (rootState.appearance.highlight) dispatch("highlight", node);
  },

  mouseLeaveFunctionality({ commit, dispatch, rootState }: Ctx) {
    commit("SET_HOVERED_NODE", { id: 0, data: {} });
    commit("SET_TOOLTIP_VISIBILITY", false);
    if (rootState.appearance.highlight) dispatch("loadColors");
  },

  /** Runs the action of the active mode (expand, collapse, explore or queue) on the clicked node. */
  async mouseClickFunctionality(
    { commit, dispatch, rootState }: Ctx,
    node: NodeRef,
  ) {
    const activeMode = rootState.activeMode;
    const label = node.data.label;
    showClickedNode(commit, dispatch, node, activeMode);
    switch (activeMode) {
      case "expand":
        await expandNode(dispatch, node);
        if (label === "song") dispatch("songAction", node);
        break;
      case "collapse":
        dispatch("collapseAction", node);
        break;
      case "explore":
        if (label === "song") dispatch("songAction", node);
        break;
      case "queue":
        dispatch("addNodesToQueue", [node]);
        break;
    }
  },

  /** Shows the node in the info panel and moves the view to it. It does not expand, and a song does not play. */
  focusNode({ commit, dispatch }: Ctx, node: GraphNode) {
    showClickedNode(commit, dispatch, node, "explore");
    dispatch("moveToNode", node);
    if (node.data.label === "song") dispatch("loadSongInfo", node);
  },

  mouseMoveFunctionality(
    { rootState, commit, dispatch }: Ctx,
    node: GraphNode | undefined,
  ) {
    if (
      !node ||
      rootState.selection.selectedNodes.length === 0 ||
      !rootState.events.moveOriginPosition
    ) {
      return;
    }
    if (rootState.mainGraph.renderState.isRendered) commit("PAUSE_RENDERING");
    dispatch("moveSelection", {
      originNode: node,
      nodesWithPositionToMove: rootState.events.originNodePositions,
      oldOriginPosition: rootState.events.moveOriginPosition,
    });
  },

  mouseDownFunctionality({ rootState, commit }: Ctx, node: GraphNode) {
    if (!isSelected(rootState, node)) return;
    commit("SET_MOUSE_PAUSED", !rootState.mainGraph.renderState.isRendered);
    commit("SET_MOVE_ORIGIN_POSITION", getNodePosition(rootState, node));
    commit(
      "SET_AFFECTED_NODES_ORIGIN_POSITION",
      rootState.selection.selectedNodes.map((selected) => {
        const position = getNodePosition(rootState, selected);
        return {
          node: { id: selected.id },
          position: { ...position },
        };
      }),
    );
  },

  mouseUpFunctionality({ rootState, commit }: Ctx, node: GraphNode) {
    if (!isSelected(rootState, node)) return;
    commit("SET_MOVE_ORIGIN_POSITION", undefined);
    commit("SET_AFFECTED_NODES_ORIGIN_POSITION", []);
    if (!rootState.events.mousePaused) commit("RESUME_RENDERING");
  },

  resizeGraphContainer(
    { commit }: Ctx,
    size: { width: number; height: number },
  ) {
    commit("RESIZE_GRAPH", size);
  },

  /** Connects the mouse events of the WebGL graph to the store. */
  initEvents({ rootState, dispatch }: Ctx) {
    const renderer = rootState.mainGraph.renderState.Renderer;
    if (!renderer) return;
    const inputEvents = renderer.createInputEvents();
    dispatch("initSelectionEvents");
    inputEvents
      .mouseEnter((node) => dispatch("mouseEnterFunctionality", node))
      .mouseLeave(() => dispatch("mouseLeaveFunctionality"))
      .click((node) => dispatch("mouseClickFunctionality", node))
      .mouseMove((node) => dispatch("mouseMoveFunctionality", node))
      .mouseDown((node) => dispatch("mouseDownFunctionality", node))
      .mouseUp((node) => dispatch("mouseUpFunctionality", node));
  },

  keyUpFunctions({ dispatch, commit, rootState, state }: Ctx, event: KeyEvent) {
    const key = event.which;
    const selectedNodes = rootState.selection.selectedNodes;
    if (key === KEY.ESC) {
      dispatch("deselect");
    } else if (key === KEY.DEL) {
      dispatch("removeSelectedNodes");
    } else if (key === KEY.C) {
      dispatch("clusterNodes");
    } else if (key === KEY.P) {
      dispatch("pinNodes", selectedNodes);
      if (rootState.searchString === "party") dispatch("clusterLoop");
    } else if (key === KEY.U) {
      dispatch("unpinNodes", selectedNodes);
    } else if (key === KEY.M) {
      commit("SET_GROUP_MOVE_ACTIVE", !rootState.events.groupMoveActive);
    } else if (key === KEY.H) {
      dispatch("toggleHighlight");
      if (rootState.appearance.highlight) dispatch("storeColors");
    } else if (key === KEY.I) {
      dispatch("invertSelection");
    } else if (modeOfKey(key) && !state.keysdown[KEY.CTRL]) {
      dispatch("setActiveMode", modeOfKey(key));
    } else if (state.keysdown[KEY.CTRL] && key === KEY.A) {
      dispatch("selectAll");
    } else if (
      (key === KEY.SHIFT || key === KEY.CTRL) &&
      state.multiSelectOverlay
    ) {
      finishMultiSelect(state, commit, dispatch);
    }
    commit("SET_KEY_UP", key);
  },

  keyDownFunctions(
    { rootState, commit, dispatch, state }: Ctx,
    event: KeyEvent,
  ) {
    const key = event.which;
    if (
      key === KEY.SHIFT &&
      !state.keysdown[KEY.SHIFT] &&
      !state.multiSelectOverlay
    ) {
      const isRendered = rootState.mainGraph.renderState.isRendered;
      commit("SET_WAS_PAUSED", !isRendered);
      if (isRendered) commit("PAUSE_RENDERING");
      commit(
        "SET_MULTI_SELECT_OVERLAY",
        startMultiSelect({
          onAreaSelectedCallback: (area) =>
            dispatch("handleAreaSelected", { area }),
          overlayCssSelector: `.${GRAPH_OVERLAY_CLASS}`,
        }),
      );
    }
    if (key === KEY.F) {
      dispatch(
        rootState.selection.selectedNodes.length > 0
          ? "fitGraphToSelection"
          : "fitGraphToScreen",
      );
      if (rootState.searchString === "fade") dispatch("fadeOut");
    }
    if (key === KEY.SPACE) dispatch("switchRendering");
    if (key === KEY.C) dispatch("applyAllConfigurations");
    commit("SET_KEY_DOWN", key);
  },

  globalMouseDownFunctions({ dispatch, state, commit }: Ctx) {
    commit("SET_GRAPH_OVERLAY_MOUSE_DOWN", true);
    if (!state.keysdown[KEY.CTRL] && state.keysdown[KEY.SHIFT])
      dispatch("setSelectedNodes", []);
  },

  globalMouseUpFunctions({ dispatch, commit, state }: Ctx) {
    if (state.multiSelectOverlay && state.graphOverlayMouseDown) {
      finishMultiSelect(state, commit, dispatch);
      commit("SET_KEY_UP", KEY.SHIFT);
    }
    commit("SET_GRAPH_OVERLAY_MOUSE_DOWN", false);
  },

  /** Adds the keyboard and mouse listeners of the graph. Calling it again replaces the old listeners. */
  initSelectionEvents({ dispatch }: Ctx) {
    removeSelectionListeners?.();
    const overlay = document.getElementsByClassName(GRAPH_OVERLAY_CLASS)[0];
    const container = document.getElementById(GRAPH_CONTAINER_ID);
    const shortcutKeys: number[] = [
      ...Object.values(KEY),
      ...ACTIVE_MODES.map((_, index) => NUMPAD_ONE + index),
    ];
    const onKeyDown = (event: Event) => {
      // Only the shortcuts lose their browser default (for example Space scrolls the page).
      if (shortcutKeys.includes((event as KeyboardEvent).which))
        event.preventDefault();
      dispatch("keyDownFunctions", event);
    };
    const onKeyUp = (event: Event) => dispatch("keyUpFunctions", event);
    const onOverlayMouseDown = (event: Event) =>
      dispatch("globalMouseDownFunctions", event);
    const onDocumentMouseUp = (event: Event) =>
      dispatch("globalMouseUpFunctions", event);

    overlay?.addEventListener("mousedown", onOverlayMouseDown);
    overlay?.addEventListener("keyup", onKeyUp);
    document.addEventListener("mouseup", onDocumentMouseUp);
    container?.addEventListener("keydown", onKeyDown);
    container?.addEventListener("keyup", onKeyUp);

    removeSelectionListeners = () => {
      overlay?.removeEventListener("mousedown", onOverlayMouseDown);
      overlay?.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mouseup", onDocumentMouseUp);
      container?.removeEventListener("keydown", onKeyDown);
      container?.removeEventListener("keyup", onKeyUp);
    };
  },

  setShowTour({ commit }: Ctx, showTour: boolean) {
    commit("SET_SHOW_TOUR", showTour);
  },
} satisfies ActionTree<EventsState, RootState>;

export default actions;
