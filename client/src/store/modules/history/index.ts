import type { Module } from "vuex";
import type { Configuration } from "@/types/configuration";
import type {
  GraphLink,
  LinkInput,
  NodeId,
  NodeInput,
  Position,
} from "@/types/graph";
import type { ActiveMode, NodeRef, RootState } from "@/store/types";
import type { ActiveCompass } from "../compass";
import actions from "./actions";
import mutations from "./mutations";

/** Where a node was and where it went, with its pin state, for undo and redo of a layout. */
export interface NodeMove {
  nodeId: NodeId;
  from: Position & { pinned: boolean };
  to: Position & { pinned: boolean };
}

/** One undoable change of the graph. A "move" change keeps its moves; its data is empty. */
export interface GraphChange {
  type: "add" | "remove" | "move";
  data: {
    nodes: NodeInput[];
    links: (LinkInput | GraphLink)[];
  };
  moves?: NodeMove[];
  /** The compass that a "move" change put on the graph. Undo takes its axes away, redo shows them again. */
  compass?: ActiveCompass;
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
