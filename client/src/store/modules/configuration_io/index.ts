import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface ConfigurationIoState {
  /** Names of the configurations saved in IndexedDB. Persisted in local storage. */
  storedConfigurationNames: string[];
  /** Object URL of the last configuration download. */
  url?: string;
}

export const configuration_io: Module<ConfigurationIoState, RootState> = {
  state: () => ({ storedConfigurationNames: [] }),
  actions,
  mutations,
};

export default configuration_io;
