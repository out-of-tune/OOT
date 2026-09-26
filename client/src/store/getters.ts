import type { GetterTree } from "vuex";
import type { BaseState, RootState } from "./types";

export const getters = {
  getNodeLabelNames: (state: Pick<BaseState, "schema">): string[] =>
    state.schema.nodeTypes.map((nodeType) => nodeType.label),

  /** Returns a function that lists the edge types that start or end at a node type. */
  getEdgeNamesForNodeLabel:
    (state: Pick<BaseState, "schema">) =>
    (labelName: string): string[] =>
      state.schema.edgeTypes
        .filter(
          (edgeType) =>
            edgeType.inbound.from === labelName ||
            edgeType.outbound.from === labelName,
        )
        .map((edgeType) => edgeType.label),
} satisfies GetterTree<BaseState, RootState>;

export default getters;
