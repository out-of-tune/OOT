import type { ActionTree, Commit, Dispatch } from "vuex";
import { getAllNodes } from "@/lib/graph";
import type { ViewMode } from "@/lib/view/contract";
import { loadViewFactory } from "@/lib/view";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

/** Spread of the random depth that 2D nodes get in the 3D view. */
const DEPTH_SPREAD = 100;

/**
 * Builds the renderer of the mode. If the 3D view cannot start (for example without WebGL),
 * it falls back to 2D and returns the mode that runs.
 */
async function buildRenderer(
  commit: Commit,
  dispatch: Dispatch,
  mode: ViewMode,
): Promise<ViewMode> {
  if (mode === "2d") {
    commit("SET_RENDERER");
    return "2d";
  }
  try {
    commit("SET_RENDERER", await loadViewFactory(mode));
    return mode;
  } catch (error) {
    console.error(error);
    dispatch(
      "setError",
      new Error("The 3D view could not start. It needs WebGL."),
    );
    commit("SET_RENDERER");
    return "2d";
  }
}

export const actions = {
  setGraphContainer({ commit }: Ctx, graphContainer: HTMLElement) {
    commit("SET_GRAPHCONTAINER", graphContainer);
  },

  async initGraph({ commit, dispatch, rootState }: Ctx) {
    commit("CREATE_GRAPH");
    const requested = rootState?.viewMode ?? "2d";
    // The 2D view builds synchronously. Only the 3D view waits for its chunk.
    let running: ViewMode = "2d";
    if (requested === "2d") commit("SET_RENDERER");
    else running = await buildRenderer(commit, dispatch, requested);
    if (rootState && running !== rootState.viewMode)
      commit("SET_VIEW_MODE", running);
    dispatch("initEvents");
    commit("START_RENDERER");
  },

  /** Switches between the 2D and the 3D view. The nodes keep their positions and pins. */
  async setViewMode({ commit, dispatch, rootState }: Ctx, mode: ViewMode) {
    const { Renderer: current, layout } = rootState.mainGraph.renderState;
    if (!current || !layout || current.mode === mode) return;
    const snapshot = getAllNodes(rootState).map((node) => ({
      node,
      position: layout.getNodePosition(node.id),
      pinned: layout.isNodePinned(node),
    }));

    dispatch("removeNodeLabels");
    commit("DISPOSE_RENDERER");
    const running = await buildRenderer(commit, dispatch, mode);

    snapshot.forEach(({ node, position, pinned }) => {
      commit("SET_NODE_POSITION", {
        nodeId: node.id,
        xPosition: position.x,
        yPosition: position.y,
        zPosition:
          running === "3d"
            ? (position.z ?? (Math.random() - 0.5) * DEPTH_SPREAD)
            : undefined,
      });
      if (pinned) commit("PIN_NODE", node);
    });
    commit("SET_VIEW_MODE", running);
    dispatch("initEvents");
    commit("START_RENDERER");
    dispatch("applyAllConfigurations");
    const selected = rootState.selection.selectedNodes;
    if (selected.length > 0) dispatch("updateSelectionUI", selected);
    // The new view starts with its own camera. Fitting shows all nodes at once.
    dispatch("fitGraphToScreen");
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
