import type { Module } from "vuex";
import type { GraphNode } from "@/types/graph";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface SelectionState {
  selectedNodes: GraphNode[];
  /** Nodes inside the selection rectangle while the user drags it. */
  temporarySelectedNodes: GraphNode[];
  modalOpen: boolean;
}

export const selection: Module<SelectionState, RootState> = {
  state: () => ({
    selectedNodes: [],
    temporarySelectedNodes: [],
    modalOpen: false,
  }),
  actions,
  mutations,
};

export default selection;
