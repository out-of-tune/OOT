import type { ActionTree, Commit, Dispatch } from "vuex";
import { getAllNodes } from "@/lib/graph";
import type { ViewFactory, ViewMode } from "@/lib/view/contract";
import { depthOf, loadViewFactory } from "@/lib/view";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

/**
 * Loads the view factory of the mode. The 3D view loads a separate chunk.
 * `undefined` means the 2D view, also as fallback when the chunk does not load.
 */
async function loadFactory(
  dispatch: Dispatch,
  mode: ViewMode,
): Promise<ViewFactory | undefined> {
  if (mode === "2d") return undefined;
  try {
    return await loadViewFactory(mode);
  } catch (error) {
    console.error(error);
    dispatch("setError", new Error("The 3D view could not load."));
    return undefined;
  }
}

/**
 * Builds the renderer synchronously, so no graph change can land between the old and the
 * new renderer. If the 3D view cannot start (for example without WebGL), it falls back to
 * 2D and returns the mode that runs.
 */
function buildRenderer(
  commit: Commit,
  dispatch: Dispatch,
  factory: ViewFactory | undefined,
): ViewMode {
  if (!factory) {
    commit("SET_RENDERER");
    return "2d";
  }
  try {
    commit("SET_RENDERER", factory);
    return "3d";
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
    const factory =
      requested === "2d" ? undefined : await loadFactory(dispatch, requested);
    const running = buildRenderer(commit, dispatch, factory);
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

    // The chunk loads while the old view still runs. From here on, all steps are synchronous.
    const factory = await loadFactory(dispatch, mode);
    if (rootState.mainGraph.renderState.Renderer !== current) return;
    dispatch("removeNodeLabels");
    commit("DISPOSE_RENDERER");
    const running = buildRenderer(commit, dispatch, factory);

    snapshot.forEach(({ node, position, pinned }) => {
      commit("SET_NODE_POSITION", {
        nodeId: node.id,
        xPosition: position.x,
        yPosition: position.y,
        zPosition: running === "3d" ? depthOf(position) : undefined,
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
