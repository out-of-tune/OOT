import type { Module } from "vuex";
import type { GraphLink, GraphNode } from "@/types/graph";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

/** Snapshot of all node and link colors, used to restore them after highlighting. */
export interface StoredColors {
  nodes: { node: GraphNode; color: number }[];
  links: { link: GraphLink; color: number }[];
}

export interface AppearanceState {
  pendingRequestCount: number;
  highlight: boolean;
  colors?: StoredColors;
}

export const appearance: Module<AppearanceState, RootState> = {
  state: () => ({ pendingRequestCount: 0, highlight: false }),
  actions,
  mutations,
};

export default appearance;
