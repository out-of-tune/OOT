import type { MutationTree } from "vuex";
import type { GraphIoState } from "./index";

export const mutations = {
  SET_STORED_GRAPH_NAMES(state, graphNames: string[]) {
    state.storedGraphNames = graphNames;
  },
  SET_GRAPH_URL(state, url: string) {
    state.url = url;
  },
} satisfies MutationTree<GraphIoState>;

export default mutations;
