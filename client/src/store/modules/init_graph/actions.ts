import type { ActionTree } from "vuex";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

export const actions = {
  setGraphContainer({ commit }: Ctx, graphContainer: HTMLElement) {
    commit("SET_GRAPHCONTAINER", graphContainer);
  },
  initGraph({ commit, dispatch }: Ctx) {
    commit("CREATE_GRAPH");
    commit("SET_RENDERER");
    dispatch("initEvents");
    commit("START_RENDERER");
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
