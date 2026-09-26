import type { MutationTree } from "vuex";
import type { ConfigurationIoState } from "./index";

export const mutations = {
  SET_CONFIGURATION_URL(state, url: string) {
    state.url = url;
  },
  SET_STORED_CONFIGURATION_NAMES(state, storedConfigurationNames: string[]) {
    state.storedConfigurationNames = storedConfigurationNames;
  },
} satisfies MutationTree<ConfigurationIoState>;

export default mutations;
