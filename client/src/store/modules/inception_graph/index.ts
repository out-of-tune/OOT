import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

export const inception_graph: Module<Record<string, never>, RootState> = {
  actions,
};

export default inception_graph;
