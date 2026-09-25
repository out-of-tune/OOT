import type { MutationTree } from "vuex";
import type { SearchState } from "./index";

export const mutations = {
  SET_ADVANCED_OPEN(state, advancedOpen: boolean) {
    state.advancedOpen = advancedOpen;
  },
} satisfies MutationTree<SearchState>;

export default mutations;
