import type { ActionTree, Commit } from "vuex";
import type { NodeUI, ScreenPoint } from "@/lib/view/contract";
import { getAllNodes } from "@/lib/graph";
import type { GraphNode, Position } from "@/types/graph";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { GraphCameraState } from "./index";
import { toHexColor } from "@/lib/color";

type Ctx = Context<GraphCameraState>;

/** "black" or "white", whichever reads better on the hex color (RRGGBB...). */
export function getContrastYIQ(hexcolor: string): "black" | "white" {
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "black" : "white";
}

/** True when the point is in front of the camera and inside the window. */
function isOnScreen(point: ScreenPoint) {
  return (
    point.visible &&
    point.x > 0 &&
    point.x < window.innerWidth &&
    point.y > 0 &&
    point.y < window.innerHeight
  );
}

function generateColorObject(ui: NodeUI) {
  const nodeColor = toHexColor(ui.color);
  return {
    textColor: getContrastYIQ(nodeColor),
    backgroundColor: `#${nodeColor}`,
  };
}

export function placeNodeLabel(
  position: Position,
  ui: NodeUI,
  rootState: RootState,
  commit: Commit,
) {
  const renderer = rootState.mainGraph.renderState.Renderer;
  if (!renderer) return;
  const point = renderer.getGraphics().toScreen(position);
  if (isOnScreen(point)) {
    commit("ADD_NODE_LABEL", {
      coordinates: { x: point.x, y: point.y },
      colors: generateColorObject(ui),
      id: ui.node.id,
      data: ui.node.data,
      dataKey: "name",
    });
  } else {
    const nodeLabel = rootState.graph_camera.nodeLabels[ui.node.id];
    if (nodeLabel) commit("REMOVE_NODE_LABEL", nodeLabel);
  }
}

export const actions = {
  moveToNode({ commit, rootState }: Ctx, node: NodeRef) {
    const layout = rootState.mainGraph.renderState.layout;
    if (!layout || node.id === 0) return;
    commit("MOVE_TO", layout.getNodePosition(node.id));
  },

  /** Centers the view on the nodes and zooms so that they fit on the screen. */
  fitGraphToNodes({ commit }: Ctx, nodes: GraphNode[]) {
    if (nodes.length > 0) commit("FIT_TO_NODES", nodes);
  },

  fitGraphToScreen({ dispatch, rootState }: Ctx) {
    dispatch("fitGraphToNodes", getAllNodes(rootState));
  },

  fitGraphToSelection({ rootState, dispatch }: Ctx) {
    const selectedNodes = rootState.selection.selectedNodes;
    if (selectedNodes.length > 0) {
      dispatch("fitGraphToNodes", selectedNodes);
    } else {
      dispatch("setInfo", "No nodes selected");
      dispatch("fitGraphToScreen");
    }
  },

  /** Draws a text label over each node on screen, and updates it while the graph moves. */
  displayNodeLabels({ rootState, commit }: Ctx) {
    rootState.mainGraph.renderState.Renderer?.getGraphics().placeNode(
      (ui, position) => {
        placeNodeLabel(position, ui, rootState, commit);
      },
    );
  },

  removeNodeLabels({ rootState, dispatch }: Ctx) {
    rootState.mainGraph.renderState.Renderer?.getGraphics().placeNode(() => {});
    dispatch("setNodeLabels", {});
  },

  setNodeLabels({ commit }: Ctx, nodeLabels: GraphCameraState["nodeLabels"]) {
    commit("SET_NODE_LABELS", nodeLabels);
  },
} satisfies ActionTree<GraphCameraState, RootState>;

export default actions;
