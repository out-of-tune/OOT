import type { MutationTree } from "vuex";
import type { AppearanceState, StoredColors } from "./index";

export const mutations = {
  SET_PENDING_REQUEST_COUNT(state, count: number) {
    state.pendingRequestCount = count;
  },
  SET_COLORS(state, colors: StoredColors) {
    state.colors = colors;
  },
  SET_HIGHLIGHT_ACTIVE(state, highlight: boolean) {
    state.highlight = highlight;
  },
} satisfies MutationTree<AppearanceState>;

export default mutations;
