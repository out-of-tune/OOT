import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface GraphIoState {
  /** Names of the graphs saved in IndexedDB. Persisted in local storage. */
  storedGraphNames: string[];
  /** Object URL of the last graph download. */
  url?: string;
}

export const graph_io: Module<GraphIoState, RootState> = {
  state: () => ({ storedGraphNames: [] }),
  actions,
  mutations,
};

export default graph_io;
