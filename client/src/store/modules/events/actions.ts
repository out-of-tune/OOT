import type { ActionTree, Commit, Dispatch } from "vuex";
import Viva from "vivagraphjs";
import { getNodePosition, getPinnedState } from "@/lib/graph";
import { startMultiSelect } from "@/lib/select";
import type { GraphNode } from "@/types/graph";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { EventsState } from "./index";

type Ctx = Context<EventsState>;

/** Key codes of the keyboard shortcuts. The Help page lists them. */
export const KEY = {
  SHIFT: 16,
  CTRL: 17,
  ESC: 27,
  SPACE: 32,
  DEL: 46,
  A: 65,
  C: 67,
  F: 70,
  H: 72,
  I: 73,
  M: 77,
  P: 80,
  U: 85,
} as const;

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

  /** Runs the action of the active mode (expand, collapse or explore) on the clicked node. */
  async mouseClickFunctionality(
    { commit, dispatch, rootState }: Ctx,
    node: NodeRef,
  ) {
    commit("SET_CURRENTNODE", node);
    const activeMode = rootState.activeMode;
    const label = node.data.label;
    if (label === "artist" || label === "album")
      dispatch("getSongSamples", node);
    dispatch("addToClickHistory", { node, action: activeMode });
    switch (activeMode) {
      case "expand":
        await dispatch("expandAction", { nodes: [node] });
        dispatch("applyAllConfigurations");
        if (label === "song") dispatch("songAction", node);
        break;
      case "collapse":
        dispatch("collapseAction", node);
        break;
      case "explore":
        if (label === "song") dispatch("songAction", node);
        break;
    }
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
          position: { x: position.x, y: position.y },
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

  changePinStatus({ commit, rootState }: Ctx, node: GraphNode) {
    commit(getPinnedState(rootState, node) ? "UNPIN_NODE" : "PIN_NODE", node);
  },

  /** Connects the mouse events of the WebGL graph to the store. */
  initEvents({ rootState, dispatch }: Ctx) {
    const renderer = rootState.mainGraph.renderState.Renderer;
    if (!renderer) return;
    const inputEvents = Viva.Graph.webglInputEvents(
      renderer.getGraphics(),
      rootState.mainGraph.Graph,
    );
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
    const shortcutKeys: number[] = Object.values(KEY);
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
