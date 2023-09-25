import {
  getAllNodes,
  getNodePosition,
  getNodeColor,
} from "@/assets/js/graphHelper.js";
import { isProd } from "../../../settings";

const moveToNode = ({ commit, rootState }, node) => {
  var layout = rootState.mainGraph.renderState.layout;
  const position = layout.getNodePosition(node.id);
  commit("MOVE_TO", position);
};

function getDesiredScale(x1, x2, y1, y2) {
  const desiredScaleX = document.body.clientWidth / (x2 - x1);
  const desiredScaleY = document.body.clientHeight / (y2 - y1);
  const desiredScale =
    desiredScaleX > desiredScaleY ? desiredScaleY : desiredScaleX;
  return desiredScale;
}

function getNodeBoundaries(nodeUis) {
  const smallestX = nodeUis.reduce((min, position) => {
    if (min.x >= position.x) {
      return position;
    }
    return min;
  }).x;
  const smallestY = nodeUis.reduce((min, position) => {
    if (min.y >= position.y) {
      return position;
    }
    return min;
  }).y;
  const biggestX = nodeUis.reduce((max, position) => {
    if (max.x <= position.x) {
      return position;
    }
    return max;
  }).x;
  const biggestY = nodeUis.reduce((max, position) => {
    if (max.y <= position.y) {
      return position;
    }
    return max;
  }).y;

  return { smallestX, smallestY, biggestX, biggestY };
}
const fitGraphToNodes = ({ rootState, commit }, nodes) => {
  if (nodes.length > 0) {
    const nodeUis = nodes.map((node) => getNodePosition(rootState, node));
    const boundaries = getNodeBoundaries(nodeUis);
    const desiredScale = getDesiredScale(
      boundaries.smallestX,
      boundaries.biggestX,
      boundaries.smallestY,
      boundaries.biggestY,
    );
    commit("MOVE_TO", {
      x:
        boundaries.smallestX + (boundaries.biggestX - boundaries.smallestX) / 2,
      y:
        boundaries.smallestY + (boundaries.biggestY - boundaries.smallestY) / 2,
    });
    if (
      desiredScale &&
      desiredScale != Infinity &&
      desiredScale != 0 &&
      desiredScale - desiredScale / 4 < 2
    ) {
      commit("ZOOM_TO_SCALE", desiredScale - desiredScale / 4);
    } else {
      commit("ZOOM_TO_SCALE", 2);
    }
  }
};

const fitGraphToScreen = ({ dispatch, rootState }) => {
  const allNodes = getAllNodes(rootState);
  dispatch("fitGraphToNodes", allNodes);
};

const fitGraphToSelection = ({ rootState, dispatch }) => {
  var selectedNodes = rootState.selection.selectedNodes;
  if (selectedNodes.length > 0) {
    dispatch("fitGraphToNodes", selectedNodes);
  } else {
    dispatch("setInfo", "No nodes selected");
    dispatch("fitGraphToScreen");
  }
};

function getContrastYIQ(hexcolor) {
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
function isNodeOnScreen(nodePosition, graphics) {
  const startPoint = graphics.transformClientToGraphCoordinates({ x: 0, y: 0 });
  const endPoint = graphics.transformClientToGraphCoordinates({
    x: window.document.body.clientWidth,
    y: window.document.body.clientHeight,
  });
  return (
    nodePosition.x > startPoint.x &&
    nodePosition.x < endPoint.x &&
    nodePosition.y > startPoint.y &&
    nodePosition.y < endPoint.y
  );
}
function generateColorObject(ui) {
  const nodeColor = ui.color.toString(16).padStart(8, "0");
  const backgroundColor = "#" + nodeColor;
  const textColor = getContrastYIQ(nodeColor);
  return { textColor, backgroundColor };
}
function calculateDomCoordinates(graphics, graphPosition) {
  return graphics.transformGraphToClientCoordinates({
    x: graphPosition.x,
    y: graphPosition.y,
  });
}

const placeNodeLabel = function (pos, ui, rootState, commit) {
  const graphics = rootState.mainGraph.renderState.Renderer.getGraphics();

  if (isNodeOnScreen(pos, graphics)) {
    const coordinates = calculateDomCoordinates(graphics, pos);
    const colors = generateColorObject(ui);
    commit("ADD_NODE_LABEL", {
      coordinates,
      colors,
      id: ui.node.id,
      data: ui.node.data,
      dataKey: "name",
    });
  } else {
    const nodeLabel = rootState.graph_camera.nodeLabels[ui.node.id];
    if (nodeLabel) {
      commit("REMOVE_NODE_LABEL", nodeLabel);
    }
  }
};

const displayNodeLabels = ({ rootState, commit }) => {
  const graphics = rootState.mainGraph.renderState.Renderer.getGraphics();
  graphics.placeNode((ui, pos) => {
    placeNodeLabel(pos, ui, rootState, commit);
  });
};

const removeNodeLabels = ({ rootState, dispatch }) => {
  const graphics = rootState.mainGraph.renderState.Renderer.getGraphics();
  graphics.placeNode(() => {});
  dispatch("setNodeLabels", {});
};

const setNodeLabels = ({ commit }, nodeLabels) => {
  commit("SET_NODE_LABELS", nodeLabels);
};
export const actions =
  isProd
    ? {
        moveToNode,
        fitGraphToScreen,
        fitGraphToSelection,
        displayNodeLabels,
        removeNodeLabels,
        setNodeLabels,
        fitGraphToNodes,
      }
    : {
        moveToNode,
        fitGraphToScreen,
        fitGraphToSelection,
        displayNodeLabels,
        removeNodeLabels,
        setNodeLabels,
        placeNodeLabel,
        fitGraphToNodes,
      };
export default actions;
