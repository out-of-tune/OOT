import Viva from "vivagraphjs";

const SET_GRAPHCONTAINER = (state, graphContainer) => {
  state.mainGraph.graphContainer = graphContainer;
};

const SET_CURRENTNODE = (state, node) => {
  state.mainGraph.currentNode = node;
};

const CREATE_GRAPH = (state) => {
  const createGraph = require("ngraph.graph");
  state.mainGraph.Graph = createGraph();
};

const RESIZE_GRAPH = (state, { width, height }) => {
  state.mainGraph.renderState.Renderer.getGraphics().updateSize(width, height);
};

const SET_RENDERER = (state) => {
  const graphics = Viva.Graph.View.webglGraphics({
    clearColor: true,
    clearColorValue: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
  });

  const layout = Viva.Graph.Layout.forceDirected(state.mainGraph.Graph, {
    springLength: state.mainGraph.renderState.layoutOptions.springLength,
    springCoeff: state.mainGraph.renderState.layoutOptions.springCoeff,
    dragCoeff: state.mainGraph.renderState.layoutOptions.dragCoeff,
    gravity: state.mainGraph.renderState.layoutOptions.gravity,
  });

  state.mainGraph.renderState.layout = layout;
  state.mainGraph.renderState.Renderer = Viva.Graph.View.renderer(
    state.mainGraph.Graph,
    {
      layout: layout,
      container: state.mainGraph.graphContainer,
      graphics: graphics,
    },
  );
};

const START_RENDERER = (state) => {
  state.mainGraph.renderState.Renderer.run();
};

const ADD_TO_GRAPH = (state, { nodes = [], links = [] }) => {
  nodes.forEach((node) => {
    state.mainGraph.Graph.addNode(node.id, node.data);
  });
  links.forEach((link) => {
    if (!state.mainGraph.Graph.hasLink(link.fromId, link.toId)) {
      const graphLink = state.mainGraph.Graph.addLink(link.fromId, link.toId);
      if (link.linkTypes) {
        graphLink.linkTypes = link.linkTypes;
      } else graphLink.linkTypes = [link.linkName];
    } else {
      const graphLink = state.mainGraph.Graph.getLink(link.fromId, link.toId);
      if (link.linkTypes) {
        link.linkTypes.forEach((linkType) => {
          if (!graphLink.linkTypes.includes(linkType)) {
            graphLink.linkTypes.push(linkType);
          }
        });
      } else if (!graphLink.linkTypes.includes(link.linkName)) {
        graphLink.linkTypes.push(link.linkName);
      }
    }
  });
};

const RERENDER_GRAPH = (state) => {
  state.mainGraph.renderState.Renderer.rerender();
};

const DELETE_NODES_FROM_GRAPH = (state, { label }) => {
  const g = state.mainGraph.Graph;
  g.forEachNode((node) => {
    if (node.data.label == label) {
      g.removeNode(node.id);
    }
  });
};

const REMOVE_LINK = (state, link) => {
  const g = state.mainGraph.Graph;
  g.removeLink(state.mainGraph.Graph.getLink(link.fromId, link.toId));
};
const REMOVE_NODE = (state, node) => {
  const g = state.mainGraph.Graph;
  g.removeNode(node.id);
};

const CLEAR_GRAPH = (state) => {
  const g = state.mainGraph.Graph;
  g.clear();
  state.mainGraph.renderState.Renderer.rerender();
  //state.mainGraph.renderState.Renderer.getGraphics().release(state.mainGraph.graphContainer)
};

const DISPOSE_RENDERER = (state) => {
  const r = state.mainGraph.renderState.Renderer;
  r.dispose();
};

const RESUME_RENDERING = (state) => {
  state.mainGraph.renderState.Renderer.resume();
  state.mainGraph.renderState.isRendered = true;
};

const PAUSE_RENDERING = (state) => {
  state.mainGraph.renderState.Renderer.pause();
  state.mainGraph.renderState.isRendered = false;
};

const SHOW_EDGES = (state) => {
  let graphics = state.mainGraph.renderState.Renderer.getGraphics();
  state.mainGraph.Graph.forEachLink(function (link) {
    let linkUI = graphics.getLinkUI(link.id);
    linkUI.color = 0xffffffff;
  });
  state.mainGraph.displayState.displayEdges = true;
};

const HIDE_EDGES = (state) => {
  let graphics = state.mainGraph.renderState.Renderer.getGraphics();
  state.mainGraph.Graph.forEachLink(function (link) {
    let linkUI = graphics.getLinkUI(link.id);
    linkUI.color = 0x00000000;
  });

  state.mainGraph.displayState.displayEdges = false;
};

const SET_NODE_COLOR = (state, { node, color }) => {
  state.mainGraph.renderState.Renderer.getGraphics().getNodeUI(node).color =
    color;
};

const SET_NODE_SIZE = (state, { node, size }) => {
  state.mainGraph.renderState.Renderer.getGraphics().getNodeUI(node).size =
    size;
};

const SET_TOOLTIP_VISIBILITY = (state, visibility) => {
  state.mainGraph.displayState.showTooltip = visibility;
};

const SET_HOVERED_NODE = (state, node) => {
  state.mainGraph.hoveredNode = node;
};
const SAVE_SCHEMA = (state, { edgeTypes, nodeTypes }) => {
  state.schema.nodeTypes = nodeTypes;
  state.schema.edgeTypes = edgeTypes;
};
const SAVE_EXPAND_CONFIGURATION = (state, configuration) => {
  state.configurations.actionConfiguration.expand = configuration;
};
const SAVE_COLLAPSE_CONFIGURATION = (state, configuration) => {
  state.configurations.actionConfiguration.collapse = configuration;
};
const SET_ACTIVE_MODE = (state, activeMode) => {
  state.activeMode = activeMode;
};
const SET_NODE_POSITION = (state, { nodeId, xPosition, yPosition }) => {
  state.mainGraph.renderState.layout.setNodePosition(
    nodeId,
    xPosition,
    yPosition,
  );
};
const PIN_NODE = (state, node) => {
  state.mainGraph.renderState.layout.pinNode(node, true);
};
const UNPIN_NODE = (state, node) => {
  state.mainGraph.renderState.layout.pinNode(node, false);
};
const SET_CONFIGURATION = (state, configuration) => {
  state.configurations = configuration;
};
const ADD_NODE_RULE = (state, { searchObject, searchString, type, args }) => {
  const rulesets =
    state.configurations.appearanceConfiguration.nodeConfiguration[type];
  const nodeRulesets = rulesets.filter((node) => {
    return node.nodeLabel === searchObject.nodeType;
  });
  if (nodeRulesets.length > 0) {
    rulesets.forEach((ruleset) => {
      if (ruleset.nodeLabel === searchObject.nodeType) {
        ruleset.rules.push({ searchObject, searchString, ...args });
      }
    });
  } else {
    rulesets.push({
      nodeLabel: searchObject.nodeType,
      rules: [{ searchObject, searchString, ...args }],
    });
  }
};
const UPDATE_NODE_RULESET = (state, { rules, nodeLabel, type }) => {
  const rulesets =
    state.configurations.appearanceConfiguration.nodeConfiguration[type];
  rulesets.forEach((ruleset) => {
    if (ruleset.nodeLabel === nodeLabel) {
      ruleset.rules = [ruleset.rules[0], ...rules];
    }
  });
};
const UPDATE_EDGE_RULES = (state, { rules }) => {
  state.configurations.appearanceConfiguration.edgeConfiguration.color = rules;
};

const SET_EDGE_COLOR = (state, { link, color }) => {
  state.mainGraph.renderState.Renderer.getGraphics().getLinkUI(link.id).color =
    color;
};

const UPDATE_TOOLTIP_RULES = (state, { rules }) => {
  state.configurations.appearanceConfiguration.nodeConfiguration.tooltip =
    rules;
};

const UPDATE_LINKTYPES = (state, linkToUpdate) => {
  state.mainGraph.Graph.forEachLink((link) => {
    if (link.id === linkToUpdate.id) {
      link.linkTypes = linkToUpdate.linkTypes;
    }
  });
};

const SET_SPOTIFY_ACCESS_TOKEN = (state, accessToken) => {
  state.spotify.accessToken = accessToken;
};

const ADD_NODE_DATA = (state, { node, data }) => {
  node.data = { ...node.data, ...data };
};
const SET_SEARCH_OBJECT = (state, searchObject) => {
  state.searchObject = searchObject;
};

const SET_SEARCH_STRING = (state, searchString) => {
  state.searchString = searchString;
};
const MOVE_TO = (state, position) => {
  state.mainGraph.renderState.Renderer.moveTo(position.x, position.y);
  state.mainGraph.renderState.Renderer.rerender();
};

const ZOOM_TO_SCALE = (state, desiredScale) => {
  var current = state.mainGraph.renderState.Renderer.getTransform().scale;
  if (current > desiredScale) {
    zoomOut(desiredScale, current);
  } else {
    zoomIn(desiredScale, current);
  }
  function zoomIn(desiredScale, currentScale) {
    if (desiredScale > currentScale) {
      currentScale = state.mainGraph.renderState.Renderer.zoomIn();
      setTimeout(function () {
        zoomIn(desiredScale, currentScale);
      }, 0.05);
    }
  }
  function zoomOut(desiredScale, currentScale) {
    if (desiredScale < currentScale) {
      currentScale = state.mainGraph.renderState.Renderer.zoomOut();
      setTimeout(function () {
        zoomOut(desiredScale, currentScale);
      }, 0.05);
    }
  }
};

function updateConfig(config, newConfig) {
  let index = config.findIndex(
    (element) => element.nodeType === newConfig.nodeType,
  );
  if (index === -1) {
    config.push(newConfig);
  } else {
    config[index] = newConfig;
  }
}
const UPDATE_EXPAND_CONFIGURATION = (state, configuration) => {
  let expandConfig = state.configurations.actionConfiguration.expand;
  updateConfig(expandConfig, configuration);
};

const UPDATE_COLLAPSE_CONFIGURATION = (state, configuration) => {
  let collapseConfig = state.configurations.actionConfiguration.collapse;
  updateConfig(collapseConfig, configuration);
};

const SET_QUEUE_VISIBILITY = (state, visible) => {
  state.visibleItems.queueDisplay = visible;
};

const SET_NODEINFO_VISIBILITY = (state, visible) => {
  state.visibleItems.nodeInfo = visible;
};

export const mutations = {
  SET_GRAPHCONTAINER,
  SET_CURRENTNODE,
  CREATE_GRAPH,
  SET_RENDERER,
  START_RENDERER,
  ADD_TO_GRAPH,
  DELETE_NODES_FROM_GRAPH,
  REMOVE_LINK,
  REMOVE_NODE,
  CLEAR_GRAPH,
  DISPOSE_RENDERER,
  RESUME_RENDERING,
  PAUSE_RENDERING,
  SHOW_EDGES,
  HIDE_EDGES,
  SET_NODE_COLOR,
  SET_NODE_SIZE,
  SET_TOOLTIP_VISIBILITY,
  SET_HOVERED_NODE,
  SAVE_SCHEMA,
  SAVE_EXPAND_CONFIGURATION,
  SAVE_COLLAPSE_CONFIGURATION,
  SET_ACTIVE_MODE,
  SET_NODE_POSITION,
  PIN_NODE,
  UNPIN_NODE,
  SET_CONFIGURATION,
  ADD_NODE_RULE,
  UPDATE_EDGE_RULES,
  UPDATE_NODE_RULESET,
  SET_EDGE_COLOR,
  UPDATE_TOOLTIP_RULES,
  UPDATE_LINKTYPES,
  SET_SEARCH_OBJECT,
  SET_SEARCH_STRING,
  MOVE_TO,
  UPDATE_EXPAND_CONFIGURATION,
  UPDATE_COLLAPSE_CONFIGURATION,
  ZOOM_TO_SCALE,
  RERENDER_GRAPH,
  SET_SPOTIFY_ACCESS_TOKEN,
  ADD_NODE_DATA,
  RESIZE_GRAPH,
  SET_QUEUE_VISIBILITY,
  SET_NODEINFO_VISIBILITY,
};
export default mutations;
