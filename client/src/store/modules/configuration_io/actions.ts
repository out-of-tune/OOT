import type { ActionTree } from "vuex";
import IndexedDbService from "@/services/IndexedDbService";
import type { Configuration } from "@/types/configuration";
import type { Context, RootState } from "@/store/types";
import type { ConfigurationIoState } from "./index";
import schema from "./schema";
import { parseJsonWithSchema } from "@/lib/json";

type Ctx = Context<ConfigurationIoState>;

/** The schema allows a configuration without tooltip rules or edge sizes. The app reads both. */
function withDefaults(configuration: Configuration): Configuration {
  const { nodeConfiguration, edgeConfiguration } =
    configuration.appearanceConfiguration;
  return {
    ...configuration,
    appearanceConfiguration: {
      nodeConfiguration: {
        ...nodeConfiguration,
        tooltip: nodeConfiguration.tooltip ?? [],
      },
      edgeConfiguration: {
        ...edgeConfiguration,
        size: edgeConfiguration.size ?? [],
      },
    },
  };
}

export const actions = {
  importConfiguration(
    { dispatch }: Ctx,
    unverifiedConfigurationString: string,
  ) {
    try {
      const configuration = parseJsonWithSchema<Configuration>(
        unverifiedConfigurationString,
        schema,
      );
      dispatch("loadConfiguration", configuration);
    } catch (error) {
      dispatch("setError", error);
    }
  },

  loadConfiguration({ commit, dispatch }: Ctx, configuration: Configuration) {
    dispatch("setSuccess", "Loaded configuration successfully");
    commit("SET_CONFIGURATION", withDefaults(configuration));
  },

  downloadConfiguration({ commit, rootState }: Ctx) {
    const file = new Blob([JSON.stringify(rootState.configurations)], {
      type: "application/json",
    });
    commit("SET_CONFIGURATION_URL", URL.createObjectURL(file));
  },

  async storeConfiguration(
    { rootState, dispatch, state, commit }: Ctx,
    name: string,
  ) {
    if (!name) {
      dispatch("setError", new Error("Enter a name for the configuration"));
      return;
    }
    try {
      await IndexedDbService.saveConfiguration(name, rootState.configurations);
      commit(
        "SET_STORED_CONFIGURATION_NAMES",
        state.storedConfigurationNames.includes(name)
          ? state.storedConfigurationNames
          : [...state.storedConfigurationNames, name],
      );
      dispatch("setSuccess", "Save complete");
    } catch {
      dispatch(
        "setError",
        new Error("Configuration could not be saved, please download it."),
      );
    }
  },

  async loadConfigurationFromIndexedDb({ dispatch }: Ctx, name: string) {
    try {
      const configuration = await IndexedDbService.getConfiguration(name);
      dispatch("loadConfiguration", configuration);
      dispatch("applyAllConfigurations");
    } catch (error) {
      dispatch("setError", error);
    }
  },

  async removeConfigurationFromIndexedDb(
    { commit, dispatch, state }: Ctx,
    name: string,
  ) {
    try {
      await IndexedDbService.deleteConfiguration(name);
      commit(
        "SET_STORED_CONFIGURATION_NAMES",
        state.storedConfigurationNames.filter(
          (configurationName) => configurationName !== name,
        ),
      );
      dispatch("setSuccess", "Configuration deleted");
    } catch (error) {
      dispatch("setError", error);
    }
  },
} satisfies ActionTree<ConfigurationIoState, RootState>;

export default actions;
