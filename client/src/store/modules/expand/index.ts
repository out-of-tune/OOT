import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions, { type Connection } from "./actions";

export interface ExpandState {
  /** Connections whose Spotify request failed in the last expand. They are retried. */
  failedExpandedConnections: Connection[];
}

export const expand: Module<ExpandState, RootState> = {
  state: () => ({ failedExpandedConnections: [] }),
  actions,
  mutations: {
    SET_FAILED_EXPANDED_CONNECTIONS(state, connections: Connection[]) {
      state.failedExpandedConnections = connections;
    },
  },
};

export default expand;
