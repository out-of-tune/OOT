import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";

export type SearchState = Record<string, never>;

export const search: Module<SearchState, RootState> = {
  state: () => ({}),
  actions,
};

export default search;
