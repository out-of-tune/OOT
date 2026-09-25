import type { ActionTree } from "vuex";
import { getAllNodes, getNodesByLabel, getPinnedState } from "@/lib/graph";
import type {
  LayoutConfiguration,
  LineLayoutOptions,
  MapLayoutOptions,
} from "@/types/configuration";
import type { GraphNode, NodeId } from "@/types/graph";
import type { Context, RootState } from "@/store/types";
import { rangeMap } from "@/lib/rangeMap";

type Ctx = Context<Record<string, never>>;

const byName = (a: GraphNode, b: GraphNode) => {
  const nameA = a.data.name ?? "";
  const nameB = b.data.name ?? "";
  return nameA > nameB ? 1 : nameB > nameA ? -1 : 0;
};

const attributeValues = (nodes: GraphNode[], attribute: string) =>
  nodes.map((node) => parseFloat(String(node.data[attribute])));

/** Approximately normal random number in [0, 1]. */
function gaussianRand() {
  let rand = 0;
  for (let index = 0; index < 6; index += 1) rand += Math.random();
  return rand / 6;
}

const calculateJitter = (value: number, jitter: number) =>
  gaussianRand() * jitter + value - jitter / 2;

/** Parses a form value. An empty value becomes 0. */
const toNumber = (value: unknown) =>
  value === "" || value == null ? 0 : parseFloat(String(value));

function parseLayoutConfiguration(
  configuration: LayoutConfiguration,
): LayoutConfiguration {
  if (configuration.layoutType === "line") {
    const options = configuration.layoutTypeOptions;
    return {
      ...configuration,
      layoutTypeOptions: {
        ...options,
        xOffset: toNumber(options.xOffset),
        yOffset: toNumber(options.yOffset),
        slope: toNumber(options.slope),
        distance: toNumber(options.distance),
      },
    };
  }
  const options = configuration.layoutTypeOptions;
  return {
    ...configuration,
    layoutTypeOptions: {
      ...options,
      xOffset: toNumber(options.xOffset),
      yOffset: toNumber(options.yOffset),
      mapXLength: toNumber(options.mapXLength),
      mapYLength: toNumber(options.mapYLength),
      xBoundaryMin: toNumber(options.xBoundaryMin),
      yBoundaryMin: toNumber(options.yBoundaryMin),
      xBoundaryMax: toNumber(options.xBoundaryMax),
      yBoundaryMax: toNumber(options.yBoundaryMax),
    },
  };
}

export const actions = {
  removePinnedStateFromNodeType({ commit, rootState }: Ctx, label: string) {
    getNodesByLabel(label, rootState).forEach((node) =>
      commit("UNPIN_NODE", node),
    );
  },

  /** Moves the unpinned neighbors of a node close to the given position. */
  setConnectedNodesNearby(
    { commit, rootState }: Ctx,
    {
      node,
      xPosition,
      yPosition,
    }: { node: { id: NodeId }; xPosition: number; yPosition: number },
  ) {
    rootState.mainGraph.Graph.forEachLinkedNode(node.id, (linkedNode) => {
      if (!getPinnedState(rootState, linkedNode)) {
        commit("SET_NODE_POSITION", {
          nodeId: linkedNode.id,
          xPosition: xPosition - Math.random() * 10,
          yPosition: yPosition - Math.random() * 10,
        });
      }
    });
  },

  /**
   * Pins nodes on a straight line, sorted by name.
   * With a `nodeLabel` it arranges all nodes of that type, else the selected nodes.
   */
  applyNodeCoordinateSystemLine(
    { commit, rootState }: Ctx,
    {
      nodeLabel,
      xOffset = 0,
      yOffset = 0,
      slope = 0,
      distance = 50,
      invertedAxis = false,
    }: Partial<LineLayoutOptions> & { nodeLabel?: string },
  ) {
    const nodes = nodeLabel
      ? getNodesByLabel(nodeLabel, rootState)
      : rootState.selection.selectedNodes;
    [...nodes].sort(byName).forEach((node, index) => {
      const along = distance * index;
      const across = slope * along;
      commit("SET_NODE_POSITION", {
        nodeId: node.id,
        xPosition: xOffset + (invertedAxis ? across : along),
        yPosition: -yOffset + (invertedAxis ? -along : -across),
      });
      commit("PIN_NODE", node);
    });
  },

  /** Pins the nodes of a type on a 2D map of two numeric attributes. */
  applyNodeCoordinateSystemMap(
    { commit, dispatch, rootState }: Ctx,
    {
      nodeLabel,
      xOffset,
      yOffset,
      xAttributeKey,
      yAttributeKey,
      mapXLength,
      mapYLength,
      xBoundaryMin,
      yBoundaryMin,
      xBoundaryMax,
      yBoundaryMax,
      jitter,
    }: MapLayoutOptions & { nodeLabel: string },
  ) {
    const nodes = getNodesByLabel(nodeLabel, rootState);
    if (nodes.length === 0) return;
    const hasBoundaries =
      xBoundaryMin > 0 &&
      xBoundaryMax > 0 &&
      yBoundaryMin > 0 &&
      yBoundaryMax > 0;
    const boundaries = hasBoundaries
      ? {
          xMin: xBoundaryMin,
          yMin: yBoundaryMin,
          xMax: xBoundaryMax,
          yMax: yBoundaryMax,
        }
      : {
          xMin: Math.min(...attributeValues(nodes, xAttributeKey)),
          yMin: Math.min(...attributeValues(nodes, yAttributeKey)),
          xMax: Math.max(...attributeValues(nodes, xAttributeKey)),
          yMax: Math.max(...attributeValues(nodes, yAttributeKey)),
        };
    if (Object.values(boundaries).some((value) => Number.isNaN(value))) return;

    nodes.forEach((node) => {
      const x =
        rangeMap(
          Number(node.data[xAttributeKey]),
          boundaries.xMin,
          boundaries.xMax,
          0,
          mapXLength,
        ) + xOffset;
      const y =
        -rangeMap(
          Number(node.data[yAttributeKey]),
          boundaries.yMin,
          boundaries.yMax,
          0,
          mapYLength,
        ) - yOffset;
      const xPosition = jitter ? calculateJitter(x, mapXLength / 200) : x;
      const yPosition = jitter ? calculateJitter(y, mapYLength / 200) : y;
      commit("SET_NODE_POSITION", { nodeId: node.id, xPosition, yPosition });
      commit("PIN_NODE", node);
      dispatch("setConnectedNodesNearby", { node, xPosition, yPosition });
    });
  },

  unpinAllNodes({ rootState, commit }: Ctx) {
    getAllNodes(rootState).forEach((node) => commit("UNPIN_NODE", node));
  },

  applyNodeCoordinateSystem(
    { dispatch }: Ctx,
    configuration: LayoutConfiguration,
  ) {
    const action =
      configuration.layoutType === "line"
        ? "applyNodeCoordinateSystemLine"
        : "applyNodeCoordinateSystemMap";
    dispatch(action, {
      nodeLabel: configuration.nodeLabel,
      ...configuration.layoutTypeOptions,
    });
  },

  applyCoordinateSystems({ rootState, dispatch }: Ctx) {
    dispatch("unpinAllNodes");
    (rootState.configurations.layoutConfiguration ?? []).forEach(
      (configuration) => {
        dispatch("applyNodeCoordinateSystem", configuration);
      },
    );
  },

  setCoordinateSystemConfiguration(
    { rootState, commit }: Ctx,
    configuration:
      LayoutConfiguration | { nodeLabel: string; layoutType: "force" },
  ) {
    if (configuration.layoutType === "force") {
      commit("DELETE_LAYOUT_CONFIGURATION", configuration.nodeLabel);
      return;
    }
    const parsed = parseLayoutConfiguration(configuration);
    const exists = (rootState.configurations.layoutConfiguration ?? []).some(
      (entry) => entry.nodeLabel === parsed.nodeLabel,
    );
    commit(
      exists ? "CHANGE_LAYOUT_CONFIGURATION" : "ADD_LAYOUT_CONFIGURATION",
      parsed,
    );
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export const testActions = { getNodesByLabel };

export default actions;
