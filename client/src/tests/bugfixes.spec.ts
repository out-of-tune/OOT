// @vitest-environment jsdom
// Regression tests for the bugs in docs/REFACTOR_PLAN.md, section 3. The numbers match the plan.
import "fake-indexeddb/auto";
import axios from "axios";
import { searchGraph } from "@/lib/graph";
import { mergeGraphQlQueries } from "@/lib/graphql";
import { gqlString } from "@/lib/graphqlString";
import { handleGraphqlTokenError, handleTokenError } from "@/lib/token";
import GraphService from "@/services/GraphService";
import IndexedDbService from "@/services/IndexedDbService";
import SpotifyService from "@/services/SpotifyService";
import { mutations } from "@/store/mutations";
import appearanceActions from "@/store/modules/appearance/actions";
import { mixColors } from "@/store/modules/appearance_mapping/actions";
import authenticationActions from "@/store/modules/authentication/actions";
import expandActions from "@/store/modules/expand/actions";
import feedbackActions from "@/store/modules/feedback/actions";
import musicPlayerMutations from "@/store/modules/music_player/mutations";
import playlistActions from "@/store/modules/playlists/actions";
import search from "@/store/modules/search";
import searchActions from "@/store/modules/search/actions";
import snackbarActions from "@/store/modules/snackbar/actions";
import snackbarMutations from "@/store/modules/snackbar/mutations";
import createGraph from "ngraph.graph";

vi.mock("axios");

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("3. search module registers its mutations", () => {
  it("has SET_ADVANCED_OPEN", () => {
    expect(search.mutations).toHaveProperty("SET_ADVANCED_OPEN");
  });
});

describe("4. layout configuration mutations exist", () => {
  const state = () =>
    ({ configurations: { layoutConfiguration: undefined } }) as never;
  const line = {
    nodeLabel: "artist",
    layoutType: "line",
    layoutTypeOptions: { xOffset: 0, yOffset: 0, slope: 0, distance: 50 },
  } as never;

  it("adds, changes and deletes a layout", () => {
    const s = state() as {
      configurations: { layoutConfiguration?: unknown[] };
    };
    mutations.ADD_LAYOUT_CONFIGURATION(s as never, line);
    expect(s.configurations.layoutConfiguration).toEqual([line]);
    const changed = { ...(line as object), layoutType: "map" } as never;
    mutations.CHANGE_LAYOUT_CONFIGURATION(s as never, changed);
    expect(s.configurations.layoutConfiguration).toEqual([changed]);
    mutations.DELETE_LAYOUT_CONFIGURATION(s as never, "artist");
    expect(s.configurations.layoutConfiguration).toEqual([]);
  });
});

describe("12. snackbar", () => {
  it("counts messages, so the same text shows again", () => {
    const state = { message: "", color: "info" as const, messageId: 0 };
    snackbarMutations.SET_MESSAGE(state, "saved");
    snackbarMutations.SET_MESSAGE(state, "saved");
    expect(state.messageId).toBe(2);
  });
});

describe("13. setError accepts a string", () => {
  it("shows the string", () => {
    const dispatch = vi.fn();
    snackbarActions.setError({ dispatch } as never, "authorization_failed");
    expect(dispatch).toHaveBeenCalledWith("setMessage", "authorization_failed");
  });
});

describe("14. IndexedDbService", () => {
  it("saves, reads and deletes a graph", async () => {
    const graph = { nodesWithPositions: [], links: [] };
    await IndexedDbService.saveGraph("mine", graph);
    await expect(IndexedDbService.getGraph("mine")).resolves.toEqual(graph);
    await IndexedDbService.deleteGraph("mine");
    await expect(IndexedDbService.getGraph("mine")).rejects.toThrow(
      "Graph not existing",
    );
  });

  it("deletes a configuration from a new database", async () => {
    await expect(
      IndexedDbService.deleteConfiguration("none"),
    ).resolves.toBeUndefined();
  });
});

describe("15. SpotifyService.putToApi", () => {
  it("resolves when the request succeeds", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: "" });
    await expect(
      SpotifyService.play("token", ["spotify:track:1"]),
    ).resolves.toBe("");
  });
});

describe("16. token helpers rethrow network errors", () => {
  it("handleTokenError", async () => {
    const networkError = new Error("Network Error");
    const fn = vi.fn().mockRejectedValue(networkError);
    const rootState = {
      authentication: { loginState: false, accessToken: "" },
      spotify: { accessToken: "t" },
    };
    await expect(
      handleTokenError(fn, [], vi.fn(), rootState as never),
    ).rejects.toBe(networkError);
  });

  it("handleGraphqlTokenError", async () => {
    const networkError = new Error("Network Error");
    const fn = vi.fn().mockRejectedValue(networkError);
    await expect(handleGraphqlTokenError(fn, [], vi.fn(), {})).rejects.toBe(
      networkError,
    );
  });
});

describe("17. expandAction stops the spinner after an error", () => {
  it("removes the pending request", async () => {
    vi.spyOn(GraphService, "getNodes").mockRejectedValue(new Error("down"));
    const dispatch = vi.fn();
    const rootState = {
      configurations: {
        actionConfiguration: {
          expand: [{ nodeType: "genre", edges: ["Genre_to_Genre"] }],
        },
      },
      schema: {
        nodeTypes: [{ label: "genre", attributes: ["name", "id"] }],
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
        ],
      },
      expand: { failedExpandedConnections: [] },
    };
    const node = { id: "Genre/1", data: { label: "genre" } };
    await expandActions.expandAction({ rootState, dispatch } as never, {
      nodes: [node],
    });
    expect(dispatch).toHaveBeenCalledWith("removePendingRequest");
    expect(dispatch).toHaveBeenCalledWith("setError", expect.any(Error));
  });
});

describe("18. pending request count", () => {
  it("does not write the state outside a mutation", () => {
    const state = Object.freeze({ pendingRequestCount: 2 });
    const commit = vi.fn();
    appearanceActions.addPendingRequest({ state, commit } as never);
    appearanceActions.removePendingRequest({ state, commit } as never);
    expect(commit).toHaveBeenNthCalledWith(1, "SET_PENDING_REQUEST_COUNT", 3);
    expect(commit).toHaveBeenNthCalledWith(2, "SET_PENDING_REQUEST_COUNT", 1);
  });
});

describe("19. GraphQL strings are escaped", () => {
  it("keeps quotes inside the literal", () => {
    expect(gqlString('Guns N" Roses')).toBe('"Guns N\\" Roses"');
    expect(
      mergeGraphQlQueries([`artist(sid: ${gqlString('a"b')}){ id }`]),
    ).toBe('{ artist(sid: "a\\"b"){ id } }');
  });

  it("sends feedback as variables", async () => {
    const getNodes = vi
      .spyOn(GraphService, "getNodes")
      .mockResolvedValue({ createfeedback: true });
    const dispatch = vi.fn();
    const sent = await feedbackActions.sendFeedback(
      { dispatch, rootState: {} } as never,
      {
        feedback: 'I "love" it',
        mail: "a@b.c",
      },
    );
    expect(sent).toBe(true);
    expect(getNodes).toHaveBeenCalledWith(
      expect.stringContaining("$feedback"),
      expect.objectContaining({ feedback: 'I "love" it', email: "a@b.c" }),
    );
  });
});

describe("20. authentication", () => {
  it("keeps only one refresh timer", () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const state = { expiryTime: 60 };
    authenticationActions.refreshTokenAfterTimeout({
      state,
      dispatch,
    } as never);
    authenticationActions.refreshTokenAfterTimeout({
      state,
      dispatch,
    } as never);
    vi.advanceTimersByTime(60_000);
    expect(
      dispatch.mock.calls.filter(([type]) => type === "refreshToken"),
    ).toHaveLength(1);
  });

  it("logs out when the browser blocks the pop-up", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const dispatch = vi.fn();
    expect(() =>
      authenticationActions.logout({ dispatch, commit: vi.fn() } as never),
    ).not.toThrow();
    expect(dispatch).toHaveBeenCalledWith("setInfo", "Logged out");
  });
});

describe("21. graph engine objects are not reactive", () => {
  it("marks the graph raw", () => {
    const state = { mainGraph: { Graph: null } } as never as {
      mainGraph: { Graph: object };
    };
    mutations.CREATE_GRAPH(state as never);
    expect((state.mainGraph.Graph as { __v_skip?: boolean }).__v_skip).toBe(
      true,
    );
  });
});

describe("like search", () => {
  it("treats regular expression characters as text", () => {
    const graph = createGraph();
    graph.addNode("a", { label: "artist", name: "AC/DC (live)" });
    const rootState = { mainGraph: { Graph: graph } } as never;
    const searchObject = {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        { attributeSearch: "name", operator: "like", attributeData: "%(live%" },
      ],
    };
    expect(searchGraph(searchObject, rootState).map((node) => node.id)).toEqual(
      ["a"],
    );
  });

  it("returns no nodes for an invalid search", () => {
    const rootState = { mainGraph: { Graph: createGraph() } } as never;
    expect(
      searchGraph({ valid: false, errors: ["x"], attributes: [] }, rootState),
    ).toEqual([]);
  });
});

describe("edge color mix", () => {
  it("rounds each channel to a whole hex value", () => {
    expect(mixColors(["00000000", "01010101"])).toBe("01010101");
  });
});

describe("queue removal", () => {
  it("keeps the index on the song that plays", () => {
    const state = {
      queue: [{}, {}, {}] as never[],
      queueIndex: 2,
    } as never as { queueIndex: number };
    musicPlayerMutations.REMOVE_FROM_QUEUE(state as never, 0);
    expect(state.queueIndex).toBe(1);
  });
});

describe("6 and 7. playlists", () => {
  it("does not load without a playlist", async () => {
    const dispatch = vi.fn();
    const commit = vi.fn();
    await playlistActions.loadPlaylist(
      { dispatch, commit, rootState: {} } as never,
      undefined,
    );
    expect(commit).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith("setInfo", "Choose a playlist first");
  });

  it("skips songs without a URI", async () => {
    const dispatch = vi.fn();
    await playlistActions.addSongsToPlaylist(
      {
        dispatch,
        rootState: { authentication: { accessToken: "t" } },
        state: { currentPlaylist: { id: "p", name: "Mix" } },
      } as never,
      [{ name: "no uri" } as never],
    );
    expect(dispatch).toHaveBeenCalledWith("setInfo", "No songs to add");
  });
});

describe("one failing endpoint keeps the results of the other", () => {
  const schema = {
    nodeTypes: [
      { label: "genre", attributes: ["name", "id"], endpoints: ["graphql"] },
      { label: "album", attributes: ["name", "id"], endpoints: ["spotify"] },
      { label: "song", attributes: ["name", "id"], endpoints: ["spotify"] },
      {
        label: "artist",
        attributes: ["name", "id"],
        endpoints: ["graphql", "spotify"],
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
  };

  it("expand keeps the Spotify nodes when the database fails", async () => {
    vi.spyOn(GraphService, "getNodes").mockRejectedValue(
      new Error("database down"),
    );
    vi.spyOn(SpotifyService, "getSongsFromAlbum").mockResolvedValue({
      items: [{ id: "s1", name: "Song" }],
    } as never);
    const dispatch = vi.fn();
    const rootState = {
      authentication: { loginState: false, accessToken: "" },
      spotify: { accessToken: "token" },
      schema,
      configurations: {
        actionConfiguration: {
          expand: [
            { nodeType: "genre", edges: ["Genre_to_Genre"] },
            { nodeType: "album", edges: ["Song_to_Album"] },
          ],
        },
      },
      expand: { failedExpandedConnections: [] },
    };
    const result = await expandActions.expandAction(
      { rootState, dispatch } as never,
      {
        nodes: [
          { id: "Genre/1", data: { label: "genre" } },
          { id: "album/a1", data: { label: "album", sid: "a1" } },
        ],
      },
    );
    expect(result.nodes.map((node) => node.id)).toEqual(["song/s1"]);
    expect(dispatch).toHaveBeenCalledWith("setError", expect.any(Error));
  });

  it("search shows database results when Spotify fails", async () => {
    vi.spyOn(SpotifyService, "searchByString").mockRejectedValue(
      new Error("Network Error"),
    );
    vi.spyOn(GraphService, "getNodes").mockResolvedValue({
      artist: [{ id: "Artist/1", name: "Radiohead" }],
      genre: [],
    } as never);
    const dispatch = vi.fn();
    const rootState = {
      authentication: { loginState: false, accessToken: "" },
      spotify: { accessToken: "" },
      schema,
      selection: { selectedNodes: [] },
      mainGraph: { Graph: createGraph() },
    };
    await searchActions.startSimpleGraphSearch(
      { dispatch, rootState } as never,
      {
        nodeType: "any",
        searchString: "radio",
      },
    );
    const added = dispatch.mock.calls.find(
      ([type]) => type === "addToGraph",
    )?.[1];
    expect(added.nodes.map((node: { id: string }) => node.id)).toEqual([
      "Artist/1",
    ]);
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      "Spotify is not reachable. Only database results are shown.",
    );
  });
});
