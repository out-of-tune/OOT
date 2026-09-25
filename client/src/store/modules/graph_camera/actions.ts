import type { ActionTree, Commit } from "vuex";
import type { NodeUI, WebglGraphics } from "vivagraphjs";
import { getAllNodes, getNodePosition } from "@/lib/graph";
import type { GraphNode, Position } from "@/types/graph";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { GraphCameraState } from "./index";
import { toHexColor } from "@/lib/color";

type Ctx = Context<GraphCameraState>;

/** Largest zoom level that fit-to-nodes uses. */
const MAX_FIT_SCALE = 2;

function getDesiredScale(x1: number, x2: number, y1: number, y2: number) {
  const scaleX = document.body.clientWidth / (x2 - x1);
  const scaleY = document.body.clientHeight / (y2 - y1);
  return Math.min(scaleX, scaleY);
}

function getNodeBoundaries(positions: Position[]) {
  const xs = positions.map((position) => position.x);
  const ys = positions.map((position) => position.y);
  return {
    smallestX: Math.min(...xs),
    smallestY: Math.min(...ys),
    biggestX: Math.max(...xs),
    biggestY: Math.max(...ys),
  };
}

/** "black" or "white", whichever reads better on the hex color (RRGGBB...). */
export function getContrastYIQ(hexcolor: string): "black" | "white" {
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "black" : "white";
}

function isNodeOnScreen(nodePosition: Position, graphics: WebglGraphics) {
  const start = graphics.transformClientToGraphCoordinates({ x: 0, y: 0 });
  const end = graphics.transformClientToGraphCoordinates({
    x: window.document.body.clientWidth,
    y: window.document.body.clientHeight,
  });
  return (
    nodePosition.x > start.x &&
    nodePosition.x < end.x &&
    nodePosition.y > start.y &&
    nodePosition.y < end.y
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
  const graphics = renderer.getGraphics();
  if (isNodeOnScreen(position, graphics)) {
    commit("ADD_NODE_LABEL", {
      coordinates: graphics.transformGraphToClientCoordinates({
        x: position.x,
        y: position.y,
      }),
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
  fitGraphToNodes({ rootState, commit }: Ctx, nodes: GraphNode[]) {
    if (nodes.length === 0) return;
    const positions = nodes.map((node) => getNodePosition(rootState, node));
    const bounds = getNodeBoundaries(positions);
    const desiredScale = getDesiredScale(
      bounds.smallestX,
      bounds.biggestX,
      bounds.smallestY,
      bounds.biggestY,
    );
    commit("MOVE_TO", {
      x: bounds.smallestX + (bounds.biggestX - bounds.smallestX) / 2,
      y: bounds.smallestY + (bounds.biggestY - bounds.smallestY) / 2,
    });
    const paddedScale = desiredScale - desiredScale / 4;
    const usable =
      Number.isFinite(desiredScale) &&
      desiredScale !== 0 &&
      paddedScale < MAX_FIT_SCALE;
    commit("ZOOM_TO_SCALE", usable ? paddedScale : MAX_FIT_SCALE);
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
