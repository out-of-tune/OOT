import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import createMutationsSharer from "vuex-shared-mutations";
import mutations from "./mutations";
import getters from "./getters";
import init_graph from "./modules/init_graph";
import inception_graph from "./modules/inception_graph";
import init_config from "./modules/init_config";
import modes from "./modules/modes";
import remove from "./modules/remove";
import appearance from "./modules/appearance";
import appearance_mapping from "./modules/appearance_mapping";
import collapse from "./modules/collapse";
import configuration_io from "./modules/configuration_io";
import coordinate_system from "./modules/coordinate_system";
import events from "./modules/events";
import expand from "./modules/expand";
import graph_io from "./modules/graph_io";
import music_player from "./modules/music_player";
import authentication from "./modules/authentication";
import user from "./modules/user";
import playlists from "./modules/playlists";
import snackbar from "./modules/snackbar";
import search from "./modules/search";
import graph_camera from "./modules/graph_camera";
import selection from "./modules/selection";
import history from "./modules/history";
import feedback from "./modules/feedback";
import share from "./modules/share";

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
  "SET_ACTIVE_DATABASE",
  "SET_DATABASE_CONNECTOR",
];

const userMutations = [
  "SET_ACCESS_TOKEN",
  "SET_REFRESH_TOKEN",
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

const vuexLocalPlaylists = new VuexPersistence({
  key: "oot_playlists",
  supportCircular: false,
  modules: ["playlists"],
  filter: (mutation) => playlistMutations.includes(mutation.type),
});

const vuexLocalConfigurations = new VuexPersistence({
  key: "oot_configurations",
  reducer: (state) => ({ configurations: state.configurations }),
  filter: (mutation) => configurationMutations.includes(mutation.type),
});

const vuexStoredGraphs = new VuexPersistence({
  key: "graph_io",
  modules: ["graph_io"],
  filter: (mutation) => graphIOMutations.includes(mutation.type),
});

const vuexStoredConfigurations = new VuexPersistence({
  key: "configuration_io",
  modules: ["configuration_io"],
  filter: (mutation) => configurationIOMutations.includes(mutation.type),
});

const vuexStoredEvents = new VuexPersistence({
  key: "oot_tour",
  //modules: ['events'],
  reducer: (state) => ({ events: { showTour: state.events.showTour } }),
  filter: (mutation) => generalSettingsMutations.includes(mutation.type),
});

export default new Vuex.Store({
  plugins: [
    vuexLocalPlaylists.plugin,
    vuexLocalConfigurations.plugin,
    vuexStoredGraphs.plugin,
    vuexStoredConfigurations.plugin,
    vuexStoredEvents.plugin,
    createMutationsSharer({
      predicate: [
        ...userMutations,
        ...configurationMutations,
        ...graphIOMutations,
        ...configurationIOMutations,
        ...generalSettingsMutations,
      ],
    }),
  ],
  state: {
    mainGraph: {
      graphContainer: {},
      Graph: {},
      currentNode: {
        id: 0,
        data: {},
      },
      hoveredNode: {
        id: 0,
        data: {},
      },
      displayState: {
        displayEdges: true,
        showTooltip: false,
      },
      renderState: {
        Renderer: null,
        isRendered: true,
        layoutOptions: {
          springLength: 5,
          springCoeff: 0.00005,
          dragCoeff: 0.01,
          gravity: -10.2,
        },
      },
    },
    schema: {
      nodeTypes: [
        {
          label: "artist",
          attributes: ["name", "id", "popularity", "sid", "mbid", "images"],
          endpoints: ["graphql", "spotify"],
        },
        { label: "genre", attributes: ["name", "id"], endpoints: ["graphql"] },
        {
          label: "album",
          attributes: [
            "name",
            "id",
            "album_group",
            "album_type",
            "href",
            "release_date",
            "release_date_precision",
            "sid",
            "total_tracks",
            "type",
            "uri",
          ],
          endpoints: ["spotify"],
        },
        {
          label: "song",
          attributes: [
            "name",
            "id",
            "disc_number",
            "duration_ms",
            "explicit",
            "href",
            "is_local",
            "preview_url",
            "sid",
            "track_number",
            "type",
            "uri",
          ],
          endpoints: ["spotify"],
        },
      ],
      edgeTypes: [
        {
          label: "Genre_to_Genre",
          inbound: {
            from: "genre",
            to: "genre",
            connectionName: "subgenres",
            endpoint: "graphQl",
          },
          outbound: {
            from: "genre",
            to: "genre",
            connectionName: "supergenres",
            endpoint: "graphQl",
          },
        },
        {
          label: "Artist_to_Genre",
          inbound: {
            from: "artist",
            to: "genre",
            connectionName: "genres",
            endpoint: "graphQl",
          },
          outbound: {
            from: "genre",
            to: "artist",
            connectionName: "artists",
            endpoint: "graphQl",
          },
        },
        {
          label: "Album_to_Artist",
          inbound: {
            from: "album",
            to: "artist",
            connectionName: "artists",
            endpoint: "spotify",
          },
          outbound: {
            from: "artist",
            to: "album",
            connectionName: "albums",
            endpoint: "spotify",
          },
        },
        {
          label: "Song_to_Album",
          inbound: {
            from: "song",
            to: "album",
            connectionName: "albums",
            endpoint: "spotify",
          },
          outbound: {
            from: "album",
            to: "song",
            connectionName: "songs",
            endpoint: "spotify",
          },
        },
      ],
    },
    configurations: {
      actionConfiguration: {
        expand: [],
        collapse: [],
      },
      appearanceConfiguration: {
        nodeConfiguration: {
          color: [],
          size: [],
          tooltip: [],
        },
        edgeConfiguration: {
          color: [],
          size: [],
        },
      },
    },
    spotify: {
      accessToken: "",
    },
    visibleItems: {
      queueDisplay: false,
      nodeInfo: true,
      addToQueueNotification: false,
    },
    activeMode: "expand",
    searchObject: {
      valid: false,
      errors: [],
      attributes: [],
      tip: { type: "nodeType", text: "" },
    },
    searchString: "",
  },
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
    inception_graph,
    music_player,
    authentication,
    user,
    playlists,
    snackbar,
    search,
    graph_camera,
    selection,
    history,
    feedback,
    share,
  },
});
