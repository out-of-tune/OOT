import { markRaw } from "vue";
import type { MutationTree } from "vuex";
import createGraph from "ngraph.graph";
import Viva from "vivagraphjs";
import type {
  ActionRule,
  Configuration,
  EdgeColorRule,
  LayoutConfiguration,
  NodeRule,
  NodeRuleType,
  NodeRuleset,
  TooltipRule,
} from "@/types/configuration";
import type {
  GraphItems,
  GraphLink,
  NodeData,
  NodeId,
  Position,
} from "@/types/graph";
import type { Schema } from "@/types/schema";
import type { SearchObject } from "@/types/search";
import type { ActiveMode, BaseState, NodeRef } from "./types";

type State = BaseState;

/** Delay between zoom steps of the zoom animation, in milliseconds. */
const ZOOM_STEP_DELAY = 16;

function requireRenderer(state: State) {
  const renderer = state.mainGraph.renderState.Renderer;
  if (!renderer) throw new Error("The graph renderer is not initialized");
  return renderer;
}

function requireLayout(state: State) {
  const layout = state.mainGraph.renderState.layout;
  if (!layout) throw new Error("The graph layout is not initialized");
  return layout;
}

const graphics = (state: State) => requireRenderer(state).getGraphics();

/** Replaces the rule for the same node type, or appends it. */
function upsertActionRule(rules: ActionRule[], rule: ActionRule) {
  const index = rules.findIndex(
    (element) => element.nodeType === rule.nodeType,
  );
  if (index === -1) rules.push(rule);
  else rules[index] = rule;
}

function layoutConfigurations(state: State): LayoutConfiguration[] {
  state.configurations.layoutConfiguration ??= [];
  return state.configurations.layoutConfiguration;
}

export const mutations = {
  SET_GRAPHCONTAINER(state, graphContainer: HTMLElement) {
    state.mainGraph.graphContainer = markRaw(graphContainer);
  },

  SET_CURRENTNODE(state, node: NodeRef) {
    state.mainGraph.currentNode = node;
  },

  CREATE_GRAPH(state) {
    // The graph engine objects are not reactive: Vue proxies would slow them down
    // and break identity checks inside the renderer.
    state.mainGraph.Graph = markRaw(createGraph());
  },

  RESIZE_GRAPH(state, { width, height }: { width: number; height: number }) {
    graphics(state).updateSize(width, height);
  },

  SET_RENDERER(state) {
    const { layoutOptions } = state.mainGraph.renderState;
    const container = state.mainGraph.graphContainer;
    if (!container) throw new Error("The graph container is not set");
    const webglGraphics = Viva.Graph.View.webglGraphics({
      clearColor: true,
      clearColorValue: { r: 0, g: 0, b: 0, a: 1 },
    });
    const layout = Viva.Graph.Layout.forceDirected(state.mainGraph.Graph, {
      springLength: layoutOptions.springLength,
      springCoeff: layoutOptions.springCoeff,
      dragCoeff: layoutOptions.dragCoeff,
      gravity: layoutOptions.gravity,
    });
    state.mainGraph.renderState.layout = markRaw(layout);
    state.mainGraph.renderState.Renderer = markRaw(
      Viva.Graph.View.renderer(state.mainGraph.Graph, {
        layout,
        container,
        graphics: webglGraphics,
      }),
    );
  },

  START_RENDERER(state) {
    requireRenderer(state).run();
  },

  ADD_TO_GRAPH(state, { nodes = [], links = [] }: Partial<GraphItems>) {
    const graph = state.mainGraph.Graph;
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    });
    links.forEach((link) => {
      const newTypes = link.linkTypes ?? (link.linkName ? [link.linkName] : []);
      const existing = graph.hasLink(link.fromId, link.toId);
      if (!existing) {
        graph.addLink(link.fromId, link.toId).linkTypes = [...newTypes];
        return;
      }
      newTypes.forEach((linkType) => {
        if (!existing.linkTypes.includes(linkType))
          existing.linkTypes.push(linkType);
      });
    });
  },

  RERENDER_GRAPH(state) {
    requireRenderer(state).rerender();
  },

  DELETE_NODES_FROM_GRAPH(state, { label }: { label: string }) {
    const graph = state.mainGraph.Graph;
    const ids: NodeId[] = [];
    graph.forEachNode((node) => {
      if (node.data.label === label) ids.push(node.id);
    });
    ids.forEach((id) => graph.removeNode(id));
  },

  REMOVE_LINK(state, link: Pick<GraphLink, "fromId" | "toId">) {
    const graph = state.mainGraph.Graph;
    const existing = graph.getLink(link.fromId, link.toId);
    if (existing) graph.removeLink(existing);
  },

  REMOVE_NODE(state, node: { id: NodeId }) {
    state.mainGraph.Graph.removeNode(node.id);
  },

  CLEAR_GRAPH(state) {
    state.mainGraph.Graph.clear();
    state.mainGraph.renderState.Renderer?.rerender();
  },

  DISPOSE_RENDERER(state) {
    requireRenderer(state).dispose();
  },

  RESUME_RENDERING(state) {
    requireRenderer(state).resume();
    state.mainGraph.renderState.isRendered = true;
  },

  PAUSE_RENDERING(state) {
    requireRenderer(state).pause();
    state.mainGraph.renderState.isRendered = false;
  },

  SHOW_EDGES(state) {
    const ui = graphics(state);
    state.mainGraph.Graph.forEachLink((link) => {
      ui.getLinkUI(link.id).color = 0xffffffff;
    });
    state.mainGraph.displayState.displayEdges = true;
  },

  HIDE_EDGES(state) {
    const ui = graphics(state);
    state.mainGraph.Graph.forEachLink((link) => {
      ui.getLinkUI(link.id).color = 0x00000000;
    });
    state.mainGraph.displayState.displayEdges = false;
  },

  SET_NODE_COLOR(state, { node, color }: { node: NodeId; color: number }) {
    graphics(state).getNodeUI(node).color = color;
  },

  SET_NODE_SIZE(state, { node, size }: { node: NodeId; size: number }) {
    graphics(state).getNodeUI(node).size = size;
  },

  SET_TOOLTIP_VISIBILITY(state, visibility: boolean) {
    state.mainGraph.displayState.showTooltip = visibility;
  },

  SET_HOVERED_NODE(state, node: NodeRef) {
    state.mainGraph.hoveredNode = node;
  },

  SAVE_SCHEMA(state, { edgeTypes, nodeTypes }: Schema) {
    state.schema.nodeTypes = nodeTypes;
    state.schema.edgeTypes = edgeTypes;
  },

  SAVE_EXPAND_CONFIGURATION(state, configuration: ActionRule[]) {
    state.configurations.actionConfiguration.expand = configuration;
  },

  SAVE_COLLAPSE_CONFIGURATION(state, configuration: ActionRule[]) {
    state.configurations.actionConfiguration.collapse = configuration;
  },

  SET_ACTIVE_MODE(state, activeMode: ActiveMode) {
    state.activeMode = activeMode;
  },

  SET_NODE_POSITION(
    state,
    {
      nodeId,
      xPosition,
      yPosition,
    }: { nodeId: NodeId; xPosition: number; yPosition: number },
  ) {
    requireLayout(state).setNodePosition(nodeId, xPosition, yPosition);
  },

  PIN_NODE(state, node: { id: NodeId }) {
    requireLayout(state).pinNode(node as never, true);
  },

  UNPIN_NODE(state, node: { id: NodeId }) {
    requireLayout(state).pinNode(node as never, false);
  },

  SET_CONFIGURATION(state, configuration: Configuration) {
    state.configurations = configuration;
  },

  ADD_NODE_RULE(
    state,
    {
      searchObject,
      searchString,
      type,
      args,
    }: {
      searchObject: SearchObject;
      searchString: string;
      type: NodeRuleType;
      args: Record<string, unknown>;
    },
  ) {
    const rulesets = state.configurations.appearanceConfiguration
      .nodeConfiguration[type] as NodeRuleset[];
    const rule = { searchObject, searchString, ...args } as NodeRule;
    const ruleset = rulesets.find(
      (element) => element.nodeLabel === searchObject.nodeType,
    );
    if (ruleset) ruleset.rules.push(rule);
    else
      rulesets.push({ nodeLabel: searchObject.nodeType ?? "", rules: [rule] });
  },

  /** Replaces all rules of a node type except the default rule (the first one). */
  UPDATE_NODE_RULESET(
    state,
    {
      rules,
      nodeLabel,
      type,
    }: { rules: NodeRule[]; nodeLabel: string; type: NodeRuleType },
  ) {
    const rulesets = state.configurations.appearanceConfiguration
      .nodeConfiguration[type] as NodeRuleset[];
    rulesets.forEach((ruleset) => {
      if (ruleset.nodeLabel === nodeLabel) {
        ruleset.rules = [ruleset.rules[0], ...rules];
      }
    });
  },

  UPDATE_EDGE_RULES(state, { rules }: { rules: EdgeColorRule[] }) {
    state.configurations.appearanceConfiguration.edgeConfiguration.color =
      rules;
  },

  SET_EDGE_COLOR(
    state,
    { link, color }: { link: Pick<GraphLink, "id">; color: number },
  ) {
    graphics(state).getLinkUI(link.id).color = color;
  },

  UPDATE_TOOLTIP_RULES(state, { rules }: { rules: TooltipRule[] }) {
    state.configurations.appearanceConfiguration.nodeConfiguration.tooltip =
      rules;
  },

  UPDATE_LINKTYPES(state, linkToUpdate: Pick<GraphLink, "id" | "linkTypes">) {
    state.mainGraph.Graph.forEachLink((link) => {
      if (link.id === linkToUpdate.id) link.linkTypes = linkToUpdate.linkTypes;
    });
  },

  SET_SPOTIFY_ACCESS_TOKEN(state, accessToken: string) {
    state.spotify.accessToken = accessToken;
  },

  ADD_NODE_DATA(
    state,
    { node, data }: { node: NodeRef; data: Partial<NodeData> },
  ) {
    state.mainGraph.currentNode = { ...node, data: { ...node.data, ...data } };
  },

  SET_SEARCH_OBJECT(state, searchObject: SearchObject) {
    state.searchObject = searchObject;
  },

  SET_SEARCH_STRING(state, searchString: string) {
    state.searchString = searchString;
  },

  MOVE_TO(state, position: Position) {
    const renderer = requireRenderer(state);
    renderer.moveTo(position.x, position.y);
    renderer.rerender();
  },

  /** Zooms step by step until the renderer reaches the desired scale. */
  ZOOM_TO_SCALE(state, desiredScale: number) {
    const renderer = requireRenderer(state);
    const zoomIn = (currentScale: number) => {
      if (desiredScale > currentScale) {
        const nextScale = renderer.zoomIn();
        setTimeout(() => zoomIn(nextScale), ZOOM_STEP_DELAY);
      }
    };
    const zoomOut = (currentScale: number) => {
      if (desiredScale < currentScale) {
        const nextScale = renderer.zoomOut();
        setTimeout(() => zoomOut(nextScale), ZOOM_STEP_DELAY);
      }
    };
    const current = renderer.getTransform().scale;
    if (current > desiredScale) zoomOut(current);
    else zoomIn(current);
  },

  UPDATE_EXPAND_CONFIGURATION(state, configuration: ActionRule) {
    upsertActionRule(
      state.configurations.actionConfiguration.expand,
      configuration,
    );
  },

  UPDATE_COLLAPSE_CONFIGURATION(state, configuration: ActionRule) {
    upsertActionRule(
      state.configurations.actionConfiguration.collapse,
      configuration,
    );
  },

  ADD_LAYOUT_CONFIGURATION(state, configuration: LayoutConfiguration) {
    layoutConfigurations(state).push(configuration);
  },

  CHANGE_LAYOUT_CONFIGURATION(state, configuration: LayoutConfiguration) {
    const configurations = layoutConfigurations(state);
    const index = configurations.findIndex(
      (entry) => entry.nodeLabel === configuration.nodeLabel,
    );
    if (index === -1) configurations.push(configuration);
    else configurations[index] = configuration;
  },

  DELETE_LAYOUT_CONFIGURATION(state, nodeLabel: string) {
    state.configurations.layoutConfiguration = layoutConfigurations(
      state,
    ).filter((entry) => entry.nodeLabel !== nodeLabel);
  },

  SET_QUEUE_VISIBILITY(state, visible: boolean) {
    state.visibleItems.queueDisplay = visible;
  },

  SET_NODEINFO_VISIBILITY(state, visible: boolean) {
    state.visibleItems.nodeInfo = visible;
  },

  SET_ADD_TO_QUEUE_NOTIFICATION_VISIBILITY(state, visible: boolean) {
    state.visibleItems.addToQueueNotification = visible;
  },
} satisfies MutationTree<State>;

export default mutations;
