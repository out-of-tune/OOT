import { eq, gt, gte, lt, lte } from "lodash-es";
import type { NodeUI } from "vivagraphjs";
import type {
  GraphLink,
  GraphNode,
  GraphObject,
  Position,
} from "@/types/graph";
import type { SearchObject } from "@/types/search";
import type { RootState } from "@/store/types";

/** The subset of the root state that the graph helpers read. */
type GraphState = Pick<RootState, "mainGraph">;

export function getNodesByLabel(
  nodeLabel: string | undefined,
  rootState: GraphState,
  nodes: GraphNode[] = [],
): GraphNode[] {
  if (nodes.length > 0) {
    return nodes.filter((node) => node.data.label === nodeLabel);
  }
  const affectedNodes: GraphNode[] = [];
  rootState.mainGraph.Graph.forEachNode((node) => {
    if (node.data.label === nodeLabel) affectedNodes.push(node);
  });
  return affectedNodes;
}

export interface NodeWithLink {
  node: GraphNode;
  link: GraphLink;
}

export const getConnectedNodesAndLinks = ({
  graph,
  node,
}: {
  graph: RootState["mainGraph"]["Graph"];
  node: Pick<GraphNode, "id">;
}): NodeWithLink[] => {
  const nodesWithLink: NodeWithLink[] = [];
  graph.forEachLinkedNode(node.id, (linkedNode, link) => {
    nodesWithLink.push({ node: linkedNode, link });
  });
  return nodesWithLink;
};

export function getAllNodes(rootState: GraphState): GraphNode[] {
  const nodes: GraphNode[] = [];
  rootState.mainGraph.Graph.forEachNode((node) => {
    nodes.push(node);
  });
  return nodes;
}

export function getAllLinks(rootState: GraphState): GraphLink[] {
  const links: GraphLink[] = [];
  rootState.mainGraph.Graph.forEachLink((link) => {
    links.push(link);
  });
  return links;
}

function getRenderer(rootState: GraphState) {
  const renderer = rootState.mainGraph.renderState.Renderer;
  if (!renderer) throw new Error("The graph renderer is not initialized");
  return renderer;
}

export function getPinnedState(
  rootState: GraphState,
  node: GraphNode,
): boolean {
  return rootState.mainGraph.renderState.layout?.isNodePinned(node) ?? false;
}

export function getNodeUi(
  rootState: GraphState,
  node: Pick<GraphNode, "id">,
): NodeUI {
  return getRenderer(rootState).getGraphics().getNodeUI(node.id);
}

export function getNodePosition(
  rootState: GraphState,
  node: Pick<GraphNode, "id">,
): Position {
  return getNodeUi(rootState, node).position;
}

export function getNodeColor(
  rootState: GraphState,
  node: Pick<GraphNode, "id">,
): number {
  return getNodeUi(rootState, node).color;
}

export function getLinkColor(
  rootState: GraphState,
  link: Pick<GraphLink, "id">,
): number {
  return getRenderer(rootState).getGraphics().getLinkUI(link.id).color;
}

/** Turns a `like` pattern with `%` wildcards into a regular expression. Other characters match literally. */
const convertToRegex = (value: string) =>
  new RegExp(
    value
      .split("%")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*?"),
  );

const like = (nodeData: unknown, searchData: string) =>
  typeof nodeData === "string"
    ? convertToRegex(searchData.toLowerCase()).test(nodeData.toLowerCase())
    : false;

export function removeQuotes(quotedString: string): string {
  return quotedString[0] === '"' &&
    quotedString[quotedString.length - 1] === '"'
    ? quotedString.substring(1, quotedString.length - 1)
    : quotedString;
}

type Comparator = (nodeValue: unknown, searchValue: string) => boolean;

const toNumber = (value: unknown) => parseFloat(String(value));

const operatorMap: Record<string, Comparator> = {
  "=": (a, b) => eq(a, b),
  "!=": (a, b) => !eq(a, b),
  ">": (a, b) => gt(toNumber(a), toNumber(b)),
  "<": (a, b) => lt(toNumber(a), toNumber(b)),
  "<=": (a, b) => lte(toNumber(a), toNumber(b)),
  ">=": (a, b) => gte(toNumber(a), toNumber(b)),
  like,
};

/** Returns the nodes that match every attribute condition of the search object. */
export function searchGraph(
  searchObject: SearchObject,
  rootState: GraphState,
  nodes: GraphNode[] = [],
): GraphNode[] {
  if (!searchObject.valid) return [];
  const nodesWithLabel = getNodesByLabel(
    searchObject.nodeType,
    rootState,
    nodes,
  );
  return nodesWithLabel.filter((node) =>
    searchObject.attributes.every((attribute) => {
      const attributeData = removeQuotes(attribute.attributeData);
      const attributeSearch = removeQuotes(attribute.attributeSearch);
      const compare = operatorMap[attribute.operator.toLowerCase().trim()];
      if (!compare) return false;
      const nodeValue =
        attributeSearch === "id" ? node.id : node.data[attributeSearch];
      return compare(nodeValue, attributeData);
    }),
  );
}

export function getGraphObject(rootState: GraphState): GraphObject {
  const links = getAllLinks(rootState);
  const nodesWithPositions = getAllNodes(rootState).map((node) => {
    const { links: _links, ...nodeData } = node;
    return {
      node: { ...nodeData },
      position: getNodePosition(rootState, node),
      pinned: getPinnedState(rootState, node),
    };
  });
  return { nodesWithPositions, links };
}
