import type { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, type Store } from "vuex";
import VuexPersistence from "vuex-persist";
import { shareMutations } from "@/lib/sharedMutations";
import getters from "./getters";
import appearance from "./modules/appearance";
import appearance_mapping from "./modules/appearance_mapping";
import authentication from "./modules/authentication";
import collapse from "./modules/collapse";
import configuration_io from "./modules/configuration_io";
import coordinate_system from "./modules/coordinate_system";
import events from "./modules/events";
import expand from "./modules/expand";
import feedback from "./modules/feedback";
import graph_camera from "./modules/graph_camera";
import graph_io from "./modules/graph_io";
import history from "./modules/history";
import init_config from "./modules/init_config";
import init_graph from "./modules/init_graph";
import modes from "./modules/modes";
import music_player from "./modules/music_player";
import playlists from "./modules/playlists";
import remove from "./modules/remove";
import search from "./modules/search";
import selection from "./modules/selection";
import share from "./modules/share";
import snackbar from "./modules/snackbar";
import spotify_player from "./modules/spotify_player";
import user from "./modules/user";
import mutations from "./mutations";
import { createRootState } from "./state";
import type { RootState } from "./types";

// Mutations that are saved in local storage or shared with the other tabs of the app.
// The Settings page opens in a new tab and changes the configuration of the graph tab.

const configurationMutations = [
  "SAVE_EXPAND_CONFIGURATION",
  "SAVE_COLLAPSE_CONFIGURATION",
  "SET_CONFIGURATION",
  "UPDATE_NODE_RULESET",
  "UPDATE_EDGE_RULES",
  "UPDATE_TOOLTIP_RULES",
  "ADD_NODE_RULE",
  "DELETE_LAYOUT_CONFIGURATION",
  "CHANGE_LAYOUT_CONFIGURATION",
  "ADD_LAYOUT_CONFIGURATION",
  "UPDATE_EXPAND_CONFIGURATION",
  "UPDATE_COLLAPSE_CONFIGURATION",
];

const userMutations = [
  "SET_ACCESS_TOKEN",
  "SET_EXPIRY_TIME",
  "SET_LOGIN_STATE",
];
const playlistMutations = [
  "SET_CURRENT_PLAYLIST",
  "SET_USER_PLAYLISTS",
  "CHANGE_PLAYLIST_LOADER_STATE",
];
const graphIOMutations = ["SET_STORED_GRAPH_NAMES"];
const configurationIOMutations = ["SET_STORED_CONFIGURATION_NAMES"];
const generalSettingsMutations = ["SET_SHOW_TOUR"];

type Mutation = { type: string };

// The storage keys must stay the same, or users lose their saved state.
const persistPlaylists = new VuexPersistence<RootState>({
  key: "oot_playlists",
  supportCircular: false,
  modules: ["playlists"],
  filter: (mutation: Mutation) => playlistMutations.includes(mutation.type),
});

const persistConfigurations = new VuexPersistence<RootState>({
  key: "oot_configurations",
  reducer: (state) => ({ configurations: state.configurations }),
  filter: (mutation: Mutation) =>
    configurationMutations.includes(mutation.type),
});

const persistGraphNames = new VuexPersistence<RootState>({
  key: "graph_io",
  modules: ["graph_io"],
  filter: (mutation: Mutation) => graphIOMutations.includes(mutation.type),
});

const persistConfigurationNames = new VuexPersistence<RootState>({
  key: "configuration_io",
  modules: ["configuration_io"],
  filter: (mutation: Mutation) =>
    configurationIOMutations.includes(mutation.type),
});

const persistTour = new VuexPersistence<RootState>({
  key: "oot_tour",
  reducer: (state) => ({ events: { showTour: state.events.showTour } }),
  filter: (mutation: Mutation) =>
    generalSettingsMutations.includes(mutation.type),
});

const persistViewMode = new VuexPersistence<RootState>({
  key: "oot_view",
  reducer: (state) => ({ viewMode: state.viewMode }),
  filter: (mutation: Mutation) => mutation.type === "SET_VIEW_MODE",
});

export const key: InjectionKey<Store<RootState>> = Symbol("store");

export const store = createStore<RootState>({
  plugins: [
    persistPlaylists.plugin,
    persistConfigurations.plugin,
    persistGraphNames.plugin,
    persistConfigurationNames.plugin,
    persistTour.plugin,
    persistViewMode.plugin,
    shareMutations<RootState>([
      ...userMutations,
      ...configurationMutations,
      ...graphIOMutations,
      ...configurationIOMutations,
      ...generalSettingsMutations,
    ]),
  ],
  // The modules add their own state at runtime.
  state: createRootState as () => RootState,
  mutations,
  getters,
  modules: {
    appearance,
    appearance_mapping,
    collapse,
    configuration_io,
    coordinate_system,
    events,
    expand,
    graph_io,
    remove,
    modes,
    init_graph,
    init_config,
    music_player,
    authentication,
    user,
    playlists,
    snackbar,
    spotify_player,
    search,
    graph_camera,
    selection,
    history,
    feedback,
    share,
  },
});

/** Typed access to the store in components. */
export function useStore(): Store<RootState> {
  return baseUseStore(key);
}

export default store;
