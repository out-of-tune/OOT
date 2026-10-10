import type { ActionTree } from "vuex";
import type { ActiveMode, Context, RootState } from "@/store/types";

type Ctx = Context<Record<string, never>>;

export const actions = {
  setActiveMode({ commit }: Ctx, activeMode: ActiveMode) {
    commit("SET_ACTIVE_MODE", activeMode);
  },

  updateGraphModificationConfiguration(
    { commit }: Ctx,
    {
      actionType,
      selectedOptions,
      nodeType,
    }: {
      actionType: "expand" | "collapse";
      selectedOptions: { edgeLabel: string }[];
      nodeType: string;
    },
  ) {
    const configuration = {
      nodeType,
      edges: selectedOptions.map((option) => option.edgeLabel),
    };
    commit(
      actionType === "expand"
        ? "UPDATE_EXPAND_CONFIGURATION"
        : "UPDATE_COLLAPSE_CONFIGURATION",
      configuration,
    );
  },
} satisfies ActionTree<Record<string, never>, RootState>;

export default actions;
