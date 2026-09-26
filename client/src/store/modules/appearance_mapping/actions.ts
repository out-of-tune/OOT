import type { ActionTree } from "vuex";
import { getAllNodes, getNodesByLabel, searchGraph } from "@/lib/graph";
import { validateSearchObject } from "@/lib/search/searchObject";
import type {
  EdgeColorRule,
  NodeRule,
  NodeRuleType,
  NodeRuleset,
  SizeRule,
  TooltipRule,
} from "@/types/configuration";
import type { GraphLink, GraphNode } from "@/types/graph";
import type { SearchObject } from "@/types/search";
import type { Context, RootState } from "@/store/types";
import { rangeMap } from "@/lib/rangeMap";

type Ctx = Context<Record<string, never>>;

/** Color of nodes that have no color rule. */
const DEFAULT_NODE_COLOR = 0x009ee8ff;
/** Color of nodes that the user clicked before. */
const CLICKED_NODE_COLOR = 0xeeeeeeff;
/** Size of nodes that have no size rule. */
const DEFAULT_NODE_SIZE = 10;

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/** Mixes RRGGBBAA colors by averaging each channel. */
export function mixColors(colorStrings: string[]): string {
  const channel = (start: number) =>
    Math.round(
      average(
        colorStrings.map((color) =>
          parseInt(color.substring(start, start + 2), 16),
        ),
      ),
    )
      .toString(16)
      .padStart(2, "0");
  return channel(0) + channel(2) + channel(4) + channel(6);
}

/** RRGGBBAA color of a link: the mix of the colors of its edge types, or white. */
export function configuredLinkColor(
  link: Pick<GraphLink, "linkTypes">,
  configuration: EdgeColorRule[],
): string {
  const colorStrings = link.linkTypes
    .flatMap((type) => configuration.filter((rule) => rule.edgeLabel === type))
    .map((rule) => rule.color);
  return colorStrings.length ? mixColors(colorStrings) : "ffffffff";
}

type NodeAction = "setNodeColorRule" | "setNodeSizeRule";
type DefaultAction = "setNodeColorDefault" | "setNodeSizeDefault";

export const actions = {
  setNodeColorDefault({ commit }: Ctx, nodes: GraphNode[]) {
    nodes.forEach((node) =>
      commit("SET_NODE_COLOR", { node: node.id, color: DEFAULT_NODE_COLOR }),
    );
  },

  setNodeColorRule(
    { commit, rootState }: Ctx,
    {
      rule,
      nodes,
    }: {
      rule: { searchObject: SearchObject; color: string };
      nodes: GraphNode[];
    },
  ) {
    searchGraph(rule.searchObject, rootState, nodes).forEach((node) =>
      commit("SET_NODE_COLOR", {
        node: node.id,
        color: parseInt(rule.color, 16),
      }),
    );
  },

  setNodeSizeRule(
    { commit, rootState, dispatch }: Ctx,
    { rule, nodes }: { rule: SizeRule; nodes: GraphNode[] },
  ) {
    if (rule.sizeType === "compare") {
      searchGraph(rule.searchObject, rootState, nodes).forEach((node) =>
        commit("SET_NODE_SIZE", { node: node.id, size: rule.size }),
      );
    } else if (rule.sizeType === "map") {
      dispatch("setNodeSizeMapped", {
        nodes: getNodesByLabel(rule.searchObject.nodeType, rootState),
        attribute: rule.searchObject.attributes[0].attributeSearch,
        minMapValue: rule.min,
        maxMapValue: rule.max,
      });
    }
  },

  /** Runs every rule of each node type on the nodes of that type. */
  applyNodeConfiguration(
    { rootState, dispatch }: Ctx,
    {
      configuration,
      ruleAction,
      defaultAction,
      nodes = [],
    }: {
      configuration: NodeRuleset[];
      ruleAction: NodeAction;
      defaultAction: DefaultAction;
      nodes?: GraphNode[];
    },
  ) {
    const affectedNodes = nodes.length > 0 ? nodes : getAllNodes(rootState);
    const groupedNodes: Record<string, GraphNode[]> = {};
    affectedNodes.forEach((node) => {
      (groupedNodes[node.data.label] ??= []).push(node);
    });
    configuration.forEach((nodeType) => {
      const group = groupedNodes[nodeType.nodeLabel];
      if (!group) return;
      if (nodeType.rules.length > 0) {
        nodeType.rules.forEach((rule) =>
          dispatch(ruleAction, { rule, nodes: group }),
        );
      } else {
        dispatch(defaultAction, group);
      }
    });
  },

  markClickedNodes({ rootState, commit }: Ctx) {
    Object.keys(rootState.history.clickHistory).forEach((nodeId) => {
      if (rootState.mainGraph.Graph.getNode(nodeId)) {
        commit("SET_NODE_COLOR", { node: nodeId, color: CLICKED_NODE_COLOR });
      }
    });
  },

  applyNodeColorConfiguration(
    { rootState, dispatch }: Ctx,
    nodes: GraphNode[] = [],
  ) {
    dispatch("applyNodeConfiguration", {
      configuration:
        rootState.configurations.appearanceConfiguration.nodeConfiguration
          .color,
      ruleAction: "setNodeColorRule",
      defaultAction: "setNodeColorDefault",
      nodes,
    });
    dispatch("markClickedNodes");
    if (rootState.appearance.highlight) dispatch("storeColors");
  },

  applyNodeSizeConfiguration(
    { rootState, dispatch }: Ctx,
    nodes: GraphNode[] = [],
  ) {
    dispatch("applyNodeConfiguration", {
      configuration:
        rootState.configurations.appearanceConfiguration.nodeConfiguration.size,
      ruleAction: "setNodeSizeRule",
      defaultAction: "setNodeSizeDefault",
      nodes,
    });
  },

  setNodeSizeDefault({ commit }: Ctx, nodes: GraphNode[]) {
    nodes.forEach((node) =>
      commit("SET_NODE_SIZE", { node: node.id, size: DEFAULT_NODE_SIZE }),
    );
  },

  /** Maps a numeric attribute linearly onto a size range. */
  setNodeSizeMapped(
    { commit }: Ctx,
    {
      nodes,
      attribute,
      minMapValue,
      maxMapValue,
    }: {
      nodes: GraphNode[];
      attribute: string;
      minMapValue: number | string;
      maxMapValue: number | string;
    },
  ) {
    const valueOf = (node: GraphNode) =>
      parseFloat(String(node.data[attribute]));
    const validNodes = nodes.filter((node) => !Number.isNaN(valueOf(node)));
    if (validNodes.length === 0) return;
    const values = validNodes.map(valueOf);
    const minInSet = Math.min(...values);
    const maxInSet = Math.max(...values);
    if (maxInSet === minInSet) return;
    validNodes.forEach((node) => {
      commit("SET_NODE_SIZE", {
        node: node.id,
        size: rangeMap(
          valueOf(node),
          minInSet,
          maxInSet,
          parseFloat(String(minMapValue)),
          parseFloat(String(maxMapValue)),
        ),
      });
    });
  },

  applyEdgeColorConfiguration({ rootState, commit, dispatch }: Ctx) {
    const configuration =
      rootState.configurations.appearanceConfiguration.edgeConfiguration.color;
    rootState.mainGraph.Graph.forEachLink((link) => {
      commit("SET_EDGE_COLOR", {
        link,
        color: parseInt(configuredLinkColor(link, configuration), 16),
      });
    });
    if (rootState.appearance.highlight) dispatch("storeColors");
  },

  /** Adds a color or size rule after it checks the search against the schema. */
  addRule(
    { commit, rootState, dispatch }: Ctx,
    {
      type,
      searchObject,
      searchString,
      ...args
    }: {
      type: NodeRuleType;
      searchObject: SearchObject;
      searchString: string;
      [key: string]: unknown;
    },
  ) {
    if (!searchObject.valid) {
      dispatch("setError", new Error("search syntax not valid"));
      return;
    }
    if (!validateSearchObject(searchObject, rootState.schema)) {
      dispatch("setError", new Error("search parameters not in schema"));
      return;
    }
    if (
      type === "size" &&
      args.sizeType === "map" &&
      searchObject.attributes.length === 0
    ) {
      dispatch(
        "setError",
        new Error("An attribute has to be chosen to add a map rule"),
      );
      return;
    }
    commit("ADD_NODE_RULE", { searchObject, searchString, type, args });
    dispatch("setSuccess", "rule added");
  },

  updateRuleset(
    { commit }: Ctx,
    {
      ruleset,
      type,
      nodeLabel,
    }: { ruleset: NodeRule[]; type: NodeRuleType; nodeLabel: string },
  ) {
    commit("UPDATE_NODE_RULESET", { rules: ruleset, nodeLabel, type });
  },

  updateEdgeRules({ commit }: Ctx, { rules }: { rules: EdgeColorRule[] }) {
    commit("UPDATE_EDGE_RULES", { rules });
  },

  updateTooltipRules({ commit }: Ctx, { rules }: { rules: TooltipRule[] }) {
    commit("UPDATE_TOOLTIP_RULES", { rules });
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
