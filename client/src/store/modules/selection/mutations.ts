import { markRaw } from "vue";
import type { MutationTree } from "vuex";
import type { GraphNode } from "@/types/graph";
import type { SelectionState } from "./index";

/** Graph nodes belong to the graph engine. Vue must not wrap them in proxies. */
const raw = (nodes: GraphNode[]) => nodes.map((node) => markRaw(node));

export const mutations = {
  SET_SELECTED_NODES(state, nodes: GraphNode[]) {
    state.selectedNodes = raw(nodes);
  },
  SET_SELECTION_MODAL_STATE(state, open: boolean) {
    state.modalOpen = open;
  },
  SET_SELECTED_INDEX(state, index: number) {
    state.selectedNodeIndex = index;
  },
  SET_TEMPORARY_SELECTED(state, nodes: GraphNode[]) {
    state.temporarySelectedNodes = raw(nodes);
  },
} satisfies MutationTree<SelectionState>;

export default mutations;
