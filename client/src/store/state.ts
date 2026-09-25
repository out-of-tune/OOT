import { markRaw } from "vue";
import createGraph from "ngraph.graph";
import type { BaseState } from "./types";

export const emptyConfiguration = (): BaseState["configurations"] => ({
  actionConfiguration: { expand: [], collapse: [] },
  appearanceConfiguration: {
    nodeConfiguration: { color: [], size: [], tooltip: [] },
    edgeConfiguration: { color: [], size: [] },
  },
});

export const createRootState = (): BaseState => ({
  mainGraph: {
    graphContainer: null,
    Graph: markRaw(createGraph()),
    currentNode: { id: 0, data: {} },
    hoveredNode: { id: 0, data: {} },
    displayState: { displayEdges: true, showTooltip: false },
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
  configurations: emptyConfiguration(),
  spotify: { accessToken: "" },
  visibleItems: {
    queueDisplay: false,
    // On small screens the panel would cover most of the graph, so it starts closed there.
    nodeInfo:
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(min-width: 1024px) and (min-height: 640px)").matches,
    addToQueueNotification: false,
  },
  activeMode: "expand",
  viewMode: "2d",
  searchObject: {
    valid: false,
    errors: [],
    attributes: [],
    tip: { type: "nodeType", text: "" },
  },
  searchString: "",
});
