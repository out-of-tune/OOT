import type { ActionTree } from "vuex";
import type { Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

export const actions = {
  deleteGraph({ commit }: Ctx) {
    commit("CLEAR_GRAPH");
  },
  deleteNodes({ commit }: Ctx, label: string) {
    commit("DELETE_NODES_FROM_GRAPH", { label });
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
