import _ from "lodash";

export function getNodesByLabel(nodeLabel, rootState, nodes = []) {
  let affectedNodes = nodes;
  if (affectedNodes.length == 0) {
    rootState.mainGraph.Graph.forEachNode((node) => {
      if (node.data.label === nodeLabel) {
        affectedNodes.push(node);
      }
    });
  } else {
    affectedNodes = affectedNodes.filter(
      (node) => node.data.label === nodeLabel,
    );
  }
  return affectedNodes;
}

export const getConnectedNodesAndLinks = ({ graph, node }) => {
  let nodesWithLink = [];
  graph.forEachLinkedNode(node.id, (linkedNode, link) => {
    nodesWithLink.push({
      node: linkedNode,
      link: link,
    });
  });
  return nodesWithLink;
};

export function getAllNodes(rootState) {
  let nodes = [];
  rootState.mainGraph.Graph.forEachNode((node) => {
    nodes.push(node);
  });
  return nodes;
}
export function getPinnedState(rootState, node) {
  return rootState.mainGraph.renderState.layout.isNodePinned(node);
}

export function getNodePosition(rootState, node) {
  return rootState.mainGraph.renderState.Renderer.getGraphics().getNodeUI(
    node.id,
  ).position;
}
export function getNodeColor(rootState, node) {
  return rootState.mainGraph.renderState.Renderer.getGraphics().getNodeUI(
    node.id,
  ).color;
}
export function getNodeUi(rootState, node) {
  return rootState.mainGraph.renderState.Renderer.getGraphics().getNodeUI(
    node.id,
  );
}

export function getLinkColor(rootState, link) {
  return rootState.mainGraph.renderState.Renderer.getGraphics().getLinkUI(
    link.id,
  ).color;
}

export function getAllLinks(rootState) {
  let links = [];
  rootState.mainGraph.Graph.forEachLink((link) => {
    links.push(link);
  });
  return links;
}
const convertToRegex = (value) => new RegExp(value.split("%").join(".*?"));
const like = (nodeData, searchData) =>
  nodeData
    ? nodeData.toLowerCase().match(convertToRegex(searchData.toLowerCase()))
    : false;
const compare = (a) => (b) => (compareFn) => compareFn(a, b);
function removeQuotes(quotedString) {
  return quotedString[0] === '"' &&
    quotedString[quotedString.length - 1] === '"'
    ? quotedString.substring(1, quotedString.length - 1)
    : quotedString;
}
export function searchGraph(searchObject, rootState, nodes = []) {
  if (searchObject.valid) {
    const nodeType = searchObject.nodeType;
    const attributes = searchObject.attributes;
    const nodesWithLabel = getNodesByLabel(nodeType, rootState, nodes);
    const formatOperator = (operator) => operator.toLowerCase().trim();
    const filteredNodes = nodesWithLabel.filter((nodeWithLabel) => {
      const at = attributes.filter((attribute) => {
        const attributeData = removeQuotes(attribute.attributeData);
        const attributeSearch = removeQuotes(attribute.attributeSearch);
        const compareNodeAttributeToSearch = (compareFn) =>
          compare(nodeWithLabel["data"][attributeSearch])(attributeData)(
            compareFn,
          );
        const compareNodeIdToSearch = (compareFn) =>
          compare(nodeWithLabel.id)(attributeData)(compareFn);
        const operatorMap = {
          "=": _.eq,
          "!=": (a, b) => !_.eq(a, b),
          ">": (a, b) => _.gt(parseFloat(a), parseFloat(b)),
          "<": (a, b) => _.lt(parseFloat(a), parseFloat(b)),
          "<=": (a, b) => _.lte(parseFloat(a), parseFloat(b)),
          ">=": (a, b) => _.gte(parseFloat(a), parseFloat(b)),
          like: like,
        };
        const compareFn = operatorMap[formatOperator(attribute.operator)];
        return attributeSearch === "id"
          ? compareNodeIdToSearch(compareFn)
          : compareNodeAttributeToSearch(compareFn);
      });
      return at.length == attributes.length;
    });
    return filteredNodes;
  }
}

export function getGraphObject(rootState) {
  const nodeLinks = getAllLinks(rootState);
  const nodes = getAllNodes(rootState);

  const nodesWithPositions = nodes.map((node) => {
    const { links, ...nodeData } = node;
    return {
      node: { ...nodeData },
      position: getNodePosition(rootState, node),
      pinned: getPinnedState(rootState, node),
    };
  });
  return {
    nodesWithPositions,
    links: nodeLinks,
  };
}
