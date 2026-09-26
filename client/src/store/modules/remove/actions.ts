import type { ActionTree } from "vuex";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

export const actions = {
  deleteGraph({ commit }: Ctx) {
    commit("CLEAR_GRAPH");
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
