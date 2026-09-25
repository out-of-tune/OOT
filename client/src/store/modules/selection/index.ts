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
  /** Index of the selected node that the camera moved to last. */
  selectedNodeIndex: number;
}

export const selection: Module<SelectionState, RootState> = {
  state: () => ({
    selectedNodes: [],
    temporarySelectedNodes: [],
    modalOpen: false,
    selectedNodeIndex: 0,
  }),
  actions,
  mutations,
};

export default selection;
