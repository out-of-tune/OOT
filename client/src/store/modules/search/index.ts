import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface SearchState {
  advancedOpen: boolean;
}

export const search: Module<SearchState, RootState> = {
  state: () => ({ advancedOpen: false }),
  actions,
  mutations,
};

export default search;
