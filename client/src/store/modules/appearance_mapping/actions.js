import {
  getNodesByLabel,
  getNodeColor,
  searchGraph,
  getAllNodes,
} from "@/assets/js/graphHelper";
import { validateSearchObject } from "@/assets/js/searchObjectHelper";

function rangeMap(valueToMap, in_min, in_max, out_min, out_max) {
  return (
    ((valueToMap - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  );
}

function getAttributeValues(nodes, attribute) {
  return nodes.map((node) => parseFloat(node["data"][attribute]));
}

function getMinValue(nodes, attribute) {
  return getAttributeValues(nodes, attribute).reduce(
    (minValue, currentValue) => {
      return currentValue < minValue ? currentValue : minValue;
    },
  );
}

function getMaxValue(nodes, attribute) {
  return getAttributeValues(nodes, attribute).reduce(
    (maxValue, currentValue) => {
      return currentValue > maxValue ? currentValue : maxValue;
    },
  );
}

const getAvg = (arr) =>
  arr.reduce((previous, current, index) => {
    return index === arr.length - 1
      ? (previous + current) / arr.length
      : previous + current;
  });

const extractColorPartValue = (color, positions) =>
  parseInt(color.substring(...positions), 16);
const getColorPartValues = (colorStrings, positions) =>
  colorStrings.map((color) => extractColorPartValue(color, positions));
const getColorPartAvg = (colorStrings, positions) =>
  getAvg(getColorPartValues(colorStrings, positions));

function getMixedColor(colorStrings) {
  return {
    red: getColorPartAvg(colorStrings, [0, 2]),
    green: getColorPartAvg(colorStrings, [2, 4]),
    blue: getColorPartAvg(colorStrings, [4, 6]),
    opacity: getColorPartAvg(colorStrings, [6]),
  };
}

function colorToString(color) {
  const formatColorPart = (part) =>
    Math.abs(part).toString(16).padStart(2, "0");
  return (
    formatColorPart(color.red) +
    formatColorPart(color.green) +
    formatColorPart(color.blue) +
    formatColorPart(color.opacity)
  );
}

function getLinkColor(link, configuration) {
  const colorStrings = link.linkTypes
    .flatMap((type) => {
      return configuration.filter((rule) => rule.edgeLabel === type);
    })
    .map((rule) => rule.color);
  return colorStrings.length
    ? colorToString(getMixedColor(colorStrings))
    : "ffffffff";
}

const setNodeColorDefault = ({ commit }, nodes) => {
  nodes.forEach((node) =>
    commit("SET_NODE_COLOR", {
      node: node.id,
      color: parseInt("009ee8ff", 16),
    }),
  );
};

const setNodeColorRule = ({ commit, rootState }, { rule, nodes }) => {
  const affectedNodes = searchGraph(rule.searchObject, rootState, nodes);
  affectedNodes.forEach((node) =>
    commit("SET_NODE_COLOR", {
      node: node.id,
      color: parseInt(rule.color, 16),
    }),
  );
};

const setNodeSizeRule = ({ commit, rootState, dispatch }, { rule, nodes }) => {
  if (rule.sizeType === "compare") {
    const affectedNodes = searchGraph(rule.searchObject, rootState, nodes);
    affectedNodes.forEach((node) =>
      commit("SET_NODE_SIZE", {
        node: node.id,
        size: rule.size,
      }),
    );
  } else if (rule.sizeType === "map") {
    const nodes = getNodesByLabel(rule.searchObject.nodeType, rootState);
    dispatch("setNodeSizeMapped", {
      nodes,
      attribute: rule.searchObject.attributes[0].attributeSearch,
      minMapValue: rule.min,
      maxMapValue: rule.max,
    });
  }
};

const applyNodeConfiguration = (
  { rootState, dispatch },
  { configuration, ruleAction, defaultAction, nodes = [] },
) => {
  const affectedNodes = nodes.length > 0 ? nodes : getAllNodes(rootState);
  //Test which one is faster
  const groupedNodes = affectedNodes.reduce(function (rv, current) {
    (rv[current["data"]["label"]] = rv[current["data"]["label"]] || []).push(
      current,
    );
    return rv;
  }, {});

  // const groupedNodes = affectedNodes.reduce(function(prev, current) {
  //     return {...prev, [current["data"]["label"]]: [...(prev[current["data"]["label"]] || []), current]}
  // }, {})
  configuration.forEach((nodeType) => {
    if (groupedNodes[nodeType.nodeLabel]) {
      if (nodeType.rules.length > 0) {
        nodeType.rules.forEach((rule) =>
          dispatch(ruleAction, {
            rule,
            nodes: groupedNodes[nodeType.nodeLabel],
          }),
        );
      } else {
        // node.label?
        dispatch(defaultAction, groupedNodes[nodeType.nodeLabel]);
      }
    }
  });
};
const markClickedNodes = ({ rootState, commit }) => {
  const clickedKeys = Object.keys(rootState.history.clickHistory);
  clickedKeys.forEach((nodeId) => {
    if (rootState.mainGraph.Graph.getNode(nodeId)) {
      commit("SET_NODE_COLOR", {
        node: nodeId,
        color: parseInt("eeeeeeff", 16),
      });
    }
  });
};

const applyNodeColorConfiguration = ({ rootState, dispatch }, nodes = []) => {
  const configuration =
    rootState.configurations.appearanceConfiguration.nodeConfiguration.color;
  dispatch("applyNodeConfiguration", {
    configuration,
    ruleAction: "setNodeColorRule",
    defaultAction: "setNodeColorDefault",
    nodes,
  });
  dispatch("markClickedNodes");
  if (rootState.appearance.highlight) {
    dispatch("storeColors");
  }
};

const applyNodeSizeConfiguration = ({ rootState, dispatch }, nodes = []) => {
  const configuration =
    rootState.configurations.appearanceConfiguration.nodeConfiguration.size;
  dispatch("applyNodeConfiguration", {
    configuration,
    ruleAction: "setNodeSizeRule",
    defaultAction: "setNodeSizeDefault",
    nodes,
  });
};

const setNodeSizeDefault = ({ commit }, nodes) => {
  nodes.forEach((node) => {
    commit("SET_NODE_SIZE", {
      node: node.id,
      size: 10,
    });
  });
};

const setNodeSizeMapped = (
  { commit },
  { nodes, attribute, minMapValue, maxMapValue },
) => {
  const validNodes = nodes.filter(
    (node) => !isNaN(parseFloat(node.data[attribute])),
  );
  if (validNodes.length > 0) {
    const minInSet = getMinValue(validNodes, attribute);
    const maxInSet = getMaxValue(validNodes, attribute);

    if (maxInSet != minInSet) {
      validNodes.forEach((node) => {
        const value = parseFloat(node["data"][attribute]);
        const size = rangeMap(
          value,
          minInSet,
          maxInSet,
          parseFloat(minMapValue),
          parseFloat(maxMapValue),
        );

        commit("SET_NODE_SIZE", {
          node: node.id,
          size: size,
        });
      });
    }
  }
};

const applyEdgeColorConfiguration = ({ rootState, commit, dispatch }) => {
  const configuration =
    rootState.configurations.appearanceConfiguration.edgeConfiguration.color;
  function setEdgeColor(link) {
    const colorString = getLinkColor(link, configuration);
    commit("SET_EDGE_COLOR", {
      link,
      color: parseInt(colorString, 16),
    });
  }
  rootState.mainGraph.Graph.forEachLink((link) => {
    setEdgeColor(link);
  });
  if (rootState.appearance.highlight) {
    dispatch("storeColors");
  }
};

const setConfiguratedEdgeColor = ({ rootState, commit }, link) => {
  const configuration =
    rootState.configurations.appearanceConfiguration.edgeConfiguration.color;
  const colorString = getLinkColor(link, configuration);
  commit("SET_EDGE_COLOR", {
    link,
    color: parseInt(colorString, 16),
  });
};

const addRule = (
  { commit, rootState, dispatch },
  { type, searchObject, searchString, ...args },
) => {
  if (searchObject.valid) {
    if (validateSearchObject(searchObject, rootState.schema)) {
      if (type === "size" && args["sizeType"] === "map") {
        if (searchObject.attributes.length > 0) {
          commit("ADD_NODE_RULE", {
            searchObject,
            searchString,
            type,
            args,
          });
          dispatch("setSuccess", "rule added");
        } else {
          dispatch(
            "setError",
            new Error("An attribute has to be chosen to add a map rule"),
          );
        }
      } else {
        commit("ADD_NODE_RULE", {
          searchObject,
          searchString,
          type,
          args,
        });
        dispatch("setSuccess", "rule added");
      }
    } else {
      dispatch("setError", new Error("search parameters not in schema"));
    }
  } else {
    dispatch("setError", new Error("search syntax not valid"));
  }
};

const updateRuleset = ({ commit, rootState }, { ruleset, type, nodeLabel }) => {
  commit("UPDATE_NODE_RULESET", {
    rules: ruleset,
    nodeLabel,
    type,
  });
};

const updateEdgeRules = ({ commit }, { rules }) => {
  commit("UPDATE_EDGE_RULES", {
    rules,
  });
};

const updateTooltipRules = ({ commit }, { rules }) => {
  commit("UPDATE_TOOLTIP_RULES", {
    rules,
  });
};

export const actions = {
  setNodeColorDefault,
  setNodeColorRule,
  applyNodeColorConfiguration,
  applyNodeSizeConfiguration,
  setNodeSizeDefault,
  setNodeSizeRule,
  setNodeSizeMapped,
  addRule,
  updateRuleset,
  applyEdgeColorConfiguration,
  updateEdgeRules,
  updateTooltipRules,
  applyNodeConfiguration,
  setConfiguratedEdgeColor,
  markClickedNodes,
};

export default actions;
