import { markRaw } from "vue";
import type { MutationTree } from "vuex";
import type { GraphNode } from "@/types/graph";
import type { SelectionState } from "./index";

/** Graph nodes belong to the graph engine. Vue must not wrap them in proxies. */
const raw = (nodes: GraphNode[]) => nodes.map((node) => markRaw(node));

export const mutations = {
  /** Runs with the root CLEAR_GRAPH, so the selection never points at removed nodes. */
  CLEAR_GRAPH(state) {
    state.selectedNodes = [];
  },
  SET_SELECTED_NODES(state, nodes: GraphNode[]) {
    state.selectedNodes = raw(nodes);
  },
  SET_SELECTION_MODAL_STATE(state, open: boolean) {
    state.modalOpen = open;
  },
  SET_TEMPORARY_SELECTED(state, nodes: GraphNode[]) {
    state.temporarySelectedNodes = raw(nodes);
  },
} satisfies MutationTree<SelectionState>;

export default mutations;
