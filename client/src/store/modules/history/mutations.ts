import type { MutationTree } from "vuex";
import type { NodeRef } from "@/store/types";
import type { ClickRecord, GraphChange, HistoryState } from "./index";

export const mutations = {
  SET_HISTORY_INDEX(state, index: number) {
    state.historyIndex = index;
  },
  SET_CHANGES(state, changes: GraphChange[]) {
    state.changes = changes;
  },
  ADD_TO_CLICK_HISTORY(
    state,
    { node, data }: { node: NodeRef; data: ClickRecord },
  ) {
    const key = String(node.id);
    state.clickHistory[key] = [...(state.clickHistory[key] ?? []), { ...data }];
  },
} satisfies MutationTree<HistoryState>;

export default mutations;
