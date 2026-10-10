import type { ActionTree } from "vuex";
import type { GraphRenderer, NodeUI, ScreenPoint } from "@/lib/view/contract";
import { getAllNodes } from "@/lib/graph";
import type { GraphNode, NodeId, Position } from "@/types/graph";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { GraphCameraState, NodeLabel } from "./index";
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

/** The label of the node at the position, or undefined when the node is off screen. */
export function nodeLabelAt(
  renderer: GraphRenderer,
  ui: NodeUI,
  position: Position,
): NodeLabel | undefined {
  const point = renderer.getGraphics().toScreen(position);
  if (!isOnScreen(point)) return undefined;
  return {
    coordinates: { x: point.x, y: point.y },
    colors: generateColorObject(ui),
    id: ui.node.id,
    data: ui.node.data,
    dataKey: "name",
  };
}

function sameLabel(a: NodeLabel | undefined, b: NodeLabel | undefined) {
  if (!a || !b) return a === b;
  return (
    a.coordinates.x === b.coordinates.x &&
    a.coordinates.y === b.coordinates.y &&
    a.colors.textColor === b.colors.textColor &&
    a.colors.backgroundColor === b.colors.backgroundColor &&
    a.data === b.data &&
    a.dataKey === b.dataKey
  );
}

/** The label pass that displayNodeLabels started last. An older pass stops committing. */
let activeLabelPass: object | undefined;

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

  /**
   * Draws a text label over each node on screen, and updates it while the graph moves.
   * The renderer places each node on each frame. Only changed labels go to the store,
   * in one commit per frame.
   */
  displayNodeLabels({ rootState, commit }: Ctx) {
    const renderer = rootState.mainGraph.renderState.Renderer;
    if (!renderer) return;
    const pass = {};
    activeLabelPass = pass;
    let changes: Map<NodeId, NodeLabel | undefined> | undefined;
    const flush = () => {
      const pending = changes;
      changes = undefined;
      if (!pending || activeLabelPass !== pass) return;
      const labels = { ...rootState.graph_camera.nodeLabels };
      pending.forEach((label, id) => {
        if (label) labels[id] = label;
        else delete labels[id];
      });
      commit("SET_NODE_LABELS", labels);
    };
    renderer.getGraphics().placeNode((ui, position) => {
      const id = ui.node.id;
      const label = nodeLabelAt(renderer, ui, position);
      const current = changes?.has(id)
        ? changes.get(id)
        : rootState.graph_camera.nodeLabels[id];
      if (sameLabel(current, label)) return;
      if (!changes) {
        changes = new Map();
        queueMicrotask(flush);
      }
      changes.set(id, label);
    });
  },

  removeNodeLabels({ rootState, dispatch }: Ctx) {
    activeLabelPass = undefined;
    rootState.mainGraph.renderState.Renderer?.getGraphics().placeNode(() => {});
    dispatch("setNodeLabels", {});
  },

  setNodeLabels({ commit }: Ctx, nodeLabels: GraphCameraState["nodeLabels"]) {
    commit("SET_NODE_LABELS", nodeLabels);
  },
} satisfies ActionTree<GraphCameraState, RootState>;

export default actions;
