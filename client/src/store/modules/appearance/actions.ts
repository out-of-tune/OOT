import type { ActionTree } from "vuex";
import createChineseWhisper from "ngraph.cw";
import {
  getAllLinks,
  getAllNodes,
  getLinkColor,
  getNodeColor,
} from "@/lib/graph";
import type { GraphNode } from "@/types/graph";
import type { Context, NodeRef, RootState } from "@/store/types";
import type { AppearanceState } from "./index";

type Ctx = Context<AppearanceState>;

/** Color of the nodes and links that are not highlighted. */
const DIMMED_COLOR = 0x77777733;

const randomOpaqueColor = () =>
  parseInt(
    `${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")}ff`,
    16,
  );

export const actions = {
  /** Colors each community of the graph (Chinese Whispers clustering) with a random color. */
  clusterNodes({ rootState, commit }: Ctx) {
    const whisper = createChineseWhisper(rootState.mainGraph.Graph);
    while (whisper.getChangeRate() > 0) whisper.step();
    whisper.createClusterMap().forEach((nodeIds) => {
      const color = randomOpaqueColor();
      nodeIds.forEach((nodeId) =>
        commit("SET_NODE_COLOR", { node: nodeId, color }),
      );
    });
  },

  toggleEdgeVisibility({ rootState, commit }: Ctx) {
    commit(
      rootState.mainGraph.displayState.displayEdges
        ? "HIDE_EDGES"
        : "SHOW_EDGES",
    );
  },

  switchRendering({ rootState, commit }: Ctx) {
    commit(
      rootState.mainGraph.renderState.isRendered
        ? "PAUSE_RENDERING"
        : "RESUME_RENDERING",
    );
  },

  rerenderGraph({ commit }: Ctx) {
    commit("RERENDER_GRAPH");
  },

  addPendingRequest({ state, commit }: Ctx) {
    commit("SET_PENDING_REQUEST_COUNT", state.pendingRequestCount + 1);
  },

  removePendingRequest({ state, commit }: Ctx) {
    commit(
      "SET_PENDING_REQUEST_COUNT",
      Math.max(state.pendingRequestCount - 1, 0),
    );
  },

  storeColors({ commit, rootState }: Ctx) {
    commit("SET_COLORS", {
      nodes: getAllNodes(rootState).map((node) => ({
        node,
        color: getNodeColor(rootState, node),
      })),
      links: getAllLinks(rootState).map((link) => ({
        link,
        color: getLinkColor(rootState, link),
      })),
    });
  },

  loadColors({ state, commit, dispatch }: Ctx) {
    if (!state.colors) return;
    state.colors.nodes.forEach((item) => {
      if (item.node)
        commit("SET_NODE_COLOR", { node: item.node.id, color: item.color });
    });
    state.colors.links.forEach((item) => {
      commit("SET_EDGE_COLOR", { link: item.link, color: item.color });
    });
    dispatch("rerenderGraph");
  },

  /** Dims everything except the node, its neighbors and the links between them. */
  highlight({ rootState, commit, dispatch }: Ctx, node: NodeRef) {
    const links = node.links ?? [];
    const nodeIds = [
      node.id,
      ...links.map((link) =>
        link.fromId === node.id ? link.toId : link.fromId,
      ),
    ];
    const linkIds = links.map((link) => link.id);

    getAllLinks(rootState)
      .filter((link) => !linkIds.includes(link.id))
      .forEach((link) =>
        commit("SET_EDGE_COLOR", { link, color: DIMMED_COLOR }),
      );
    getAllNodes(rootState)
      .filter((graphNode) => !nodeIds.includes(graphNode.id))
      .forEach((graphNode) =>
        commit("SET_NODE_COLOR", { node: graphNode.id, color: DIMMED_COLOR }),
      );
    nodeIds.forEach((nodeId) =>
      dispatch("setNodeOpacity", { node: { id: nodeId }, opacity: "ff" }),
    );
    linkIds.forEach((linkId) =>
      dispatch("setLinkOpacity", { link: { id: linkId }, opacity: "ff" }),
    );
    dispatch("rerenderGraph");
  },

  toggleHighlight({ state, commit }: Ctx) {
    commit("SET_HIGHLIGHT_ACTIVE", !state.highlight);
  },

  /** Easter egg ("party"): recolors the clusters 50 times, then restores the colors. */
  clusterLoop({ dispatch }: Ctx) {
    dispatch("storeColors");
    const step = (remaining: number) => {
      if (remaining > 0) {
        dispatch("clusterNodes");
        dispatch("rerenderGraph");
        setTimeout(() => step(remaining - 1), 30);
      } else {
        dispatch("loadColors");
        dispatch("rerenderGraph");
      }
    };
    step(50);
  },

  /** Easter egg ("fade"): removes the nodes one by one. */
  fadeOut({ dispatch, commit, rootState }: Ctx) {
    const nodes: GraphNode[] = getAllNodes(rootState);
    const removeNext = (index: number) => {
      setTimeout(() => {
        commit("REMOVE_NODE", nodes[index]);
        dispatch("rerenderGraph");
        if (index > 0) removeNext(index - 1);
      }, 3);
    };
    if (nodes.length > 0) removeNext(nodes.length - 1);
  },
} satisfies ActionTree<AppearanceState, RootState>;

export default actions;
