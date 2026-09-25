import type { MutationTree } from "vuex";
import type { GraphCameraState, NodeLabel } from "./index";

export const mutations = {
  SET_NODE_LABELS(state, nodeLabels: Record<string, NodeLabel>) {
    state.nodeLabels = nodeLabels;
  },
  ADD_NODE_LABEL(state, nodeLabel: NodeLabel) {
    state.nodeLabels[nodeLabel.id] = nodeLabel;
  },
  REMOVE_NODE_LABEL(state, nodeLabel: Pick<NodeLabel, "id">) {
    const { [nodeLabel.id]: _removed, ...rest } = state.nodeLabels;
    state.nodeLabels = rest;
  },
} satisfies MutationTree<GraphCameraState>;

export default mutations;
