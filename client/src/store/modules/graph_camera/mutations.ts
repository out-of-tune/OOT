import type { MutationTree } from "vuex";
import type { GraphCameraState, NodeLabel } from "./index";

export const mutations = {
  SET_NODE_LABELS(state, nodeLabels: Record<string, NodeLabel>) {
    state.nodeLabels = nodeLabels;
  },
} satisfies MutationTree<GraphCameraState>;

export default mutations;
