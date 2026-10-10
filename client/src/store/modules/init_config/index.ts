import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

export const init_config: Module<Record<string, never>, RootState> = {
  actions,
};

export default init_config;
