import type { Module } from "vuex";
import type { Configuration } from "@/types/configuration";
import type { GraphLink, LinkInput, NodeInput } from "@/types/graph";
import type { ActiveMode, NodeRef, RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

/** One undoable change of the graph. */
export interface GraphChange {
  type: "add" | "remove";
  data: {
    nodes: NodeInput[];
    links: (LinkInput | GraphLink)[];
  };
}

export interface ClickRecord {
  node: NodeRef;
  timestamp: number;
  action: ActiveMode;
  configuration: Configuration;
}

export interface HistoryState {
  historyIndex: number;
  changes: GraphChange[];
  clickHistory: Record<string, ClickRecord[]>;
}

export const history: Module<HistoryState, RootState> = {
  state: () => ({ historyIndex: -1, changes: [], clickHistory: {} }),
  actions,
  mutations,
};

export default history;
