import SpotifyService from "@/services/SpotifyService";

vi.mock("@/services/SpotifyService");
import { actions } from "../actions";

const {
  changePlaylistLoaderState,
  getCurrentUsersPlaylists,
  setCurrentPlaylist,
  addSongToPlaylist,
  addSongsToPlaylist,
  loadPlaylist,
} = actions;

describe("changePlaylistLoaderState", () => {
  it("changes playlistOpen to true", () => {
    const commit = vi.fn();
    const modalState = true;
    changePlaylistLoaderState({ commit }, modalState);
    expect(commit).toHaveBeenCalledWith("CHANGE_PLAYLIST_LOADER_STATE", true);
  });
});

describe("getCurrentUsersPlaylists", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      authentication: {
        accessToken: 123,
      },
    };
    SpotifyService.getCurrentUserPlaylists.mockResolvedValue({
      items: [{ name: "playlist 1" }, { name: "playlist 2" }],
    });
  });
  it("writes retrieved playlists to the state", async () => {
    await getCurrentUsersPlaylists({
      commit,
      rootState,
      state: { currentPlaylist: {} },
    });
    expect(commit).toHaveBeenCalledWith("SET_USER_PLAYLISTS", [
      { name: "playlist 1" },
      { name: "playlist 2" },
    ]);
  });
  it("keeps the chosen playlist up to date, for example after a rename in another app", async () => {
    SpotifyService.getCurrentUserPlaylists.mockResolvedValue({
      items: [{ id: "p1", name: "new name" }],
      total: 1,
      next: null,
    });
    await getCurrentUsersPlaylists({
      commit,
      rootState,
      state: { currentPlaylist: { id: "p1", name: "old name" } },
    });
    expect(commit).toHaveBeenCalledWith("SET_PLAYLISTS_TOTAL", 1);
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_PLAYLIST", {
      id: "p1",
      name: "new name",
    });
  });
});

describe("loadMoreCurrentUsersPlaylists", () => {
  const rootState = { authentication: { accessToken: "token" } };

  it("appends the next page and drops playlists that the page repeats", async () => {
    const commit = vi.fn();
    SpotifyService.getCurrentUserPlaylists.mockResolvedValue({
      items: [{ id: "b" }, { id: "c" }],
      total: 3,
      next: null,
    });
    await actions.loadMoreCurrentUsersPlaylists({
      commit,
      rootState,
      state: { playlists: [{ id: "a" }, { id: "b" }], playlistsTotal: 4 },
    } as never);
    expect(SpotifyService.getCurrentUserPlaylists).toHaveBeenCalledWith(
      "token",
      50,
      2,
    );
    expect(commit).toHaveBeenCalledWith("SET_USER_PLAYLISTS", [
      { id: "a" },
      { id: "b" },
      { id: "c" },
    ]);
    expect(commit).toHaveBeenCalledWith("SET_PLAYLISTS_TOTAL", 3);
  });

  it("does not load when every playlist is loaded", async () => {
    SpotifyService.getCurrentUserPlaylists.mockClear();
    await actions.loadMoreCurrentUsersPlaylists({
      commit: vi.fn(),
      rootState,
      state: { playlists: [{ id: "a" }], playlistsTotal: 1 },
    } as never);
    expect(SpotifyService.getCurrentUserPlaylists).not.toHaveBeenCalled();
  });

  it("drops a page when the first page loaded again meanwhile", async () => {
    const commit = vi.fn();
    let resolvePage: (page: unknown) => void = () => undefined;
    SpotifyService.getCurrentUserPlaylists.mockReturnValueOnce(
      new Promise((resolve) => (resolvePage = resolve)),
    );
    const more = actions.loadMoreCurrentUsersPlaylists({
      commit,
      rootState,
      state: { playlists: [{ id: "a" }], playlistsTotal: 5 },
    } as never);
    SpotifyService.getCurrentUserPlaylists.mockResolvedValueOnce({
      items: [{ id: "new" }],
      total: 1,
      next: null,
    });
    await getCurrentUsersPlaylists({
      commit,
      rootState,
      state: { currentPlaylist: {} },
    });
    resolvePage({ items: [{ id: "old" }], total: 5, next: "next" });
    await more;
    expect(commit).not.toHaveBeenCalledWith("SET_USER_PLAYLISTS", [
      { id: "a" },
      { id: "old" },
    ]);
  });
});

describe("createPlaylist", () => {
  const rootState = {
    authentication: { accessToken: "token", loginState: true },
  };

  it("creates a private playlist, adds the songs and puts it first", async () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    SpotifyService.createPlaylist = vi
      .fn()
      .mockResolvedValue({ id: "new", name: "Mix" });
    SpotifyService.addSongsToPlaylist = vi.fn().mockResolvedValue(undefined);
    const playlist = await actions.createPlaylist(
      {
        commit,
        dispatch,
        rootState,
        state: { playlists: [{ id: "old" }], playlistsTotal: 1 },
      } as never,
      { name: " Mix ", uris: ["u1", "u2"] },
    );
    expect(playlist).toEqual({ id: "new", name: "Mix" });
    expect(SpotifyService.createPlaylist).toHaveBeenCalledWith("token", "Mix", {
      description: "Made with out-of-tune",
    });
    expect(SpotifyService.addSongsToPlaylist).toHaveBeenCalledWith(
      "token",
      "new",
      ["u1", "u2"],
    );
    expect(commit).toHaveBeenCalledWith("SET_USER_PLAYLISTS", [
      { id: "new", name: "Mix" },
      { id: "old" },
    ]);
    expect(commit).toHaveBeenCalledWith("SET_PLAYLISTS_TOTAL", 2);
  });

  it("asks for a name", async () => {
    const dispatch = vi.fn();
    SpotifyService.createPlaylist = vi.fn();
    await actions.createPlaylist(
      { commit: vi.fn(), dispatch, rootState, state: {} } as never,
      { name: "  " },
    );
    expect(SpotifyService.createPlaylist).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      "Give the playlist a name",
    );
  });

  it("reports a failed request", async () => {
    const dispatch = vi.fn();
    SpotifyService.createPlaylist = vi
      .fn()
      .mockRejectedValue({ response: { status: 403 } });
    const playlist = await actions.createPlaylist(
      {
        commit: vi.fn(),
        dispatch,
        rootState,
        state: { playlists: [] },
      } as never,
      { name: "Mix" },
    );
    expect(playlist).toBeUndefined();
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("The playlist could not be created (403)"),
    );
  });
});

describe("setCurrentPlaylist", () => {
  const commit = vi.fn();
  const playlist = { name: "playlist 1" };
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });

  it("sets current playlist", () => {
    setCurrentPlaylist({ commit, dispatch }, playlist);
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_PLAYLIST", {
      name: "playlist 1",
    });
  });
});
describe("addSongToPlaylist", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("calls add songs to playlist", async () => {
    SpotifyService.addSongToPlaylist = vi.fn();
    await addSongToPlaylist({ dispatch }, "SongURIString");
    expect(dispatch).toHaveBeenCalledWith("addSongsToPlaylist", [
      "SongURIString",
    ]);
  });
});
describe("addSongsToPlaylist", () => {
  let dispatch;
  let rootState;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    rootState = {
      playlist: {
        currentPlaylist: {
          id: "12345",
          name: "sixSevenEight",
        },
      },
      authentication: {
        accessToken: "TestToken",
      },
    };
    state = rootState.playlist;
  });
  it("adds Songs to playlist", async () => {
    SpotifyService.addSongsToPlaylist = vi.fn();
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      { name: "song1", uri: "uri1" },
      { name: "song2", uri: "uri2" },
    ]);
    expect(SpotifyService.addSongsToPlaylist).toHaveBeenCalledWith(
      "TestToken",
      "12345",
      ["uri1", "uri2"],
    );
  });
  it("sets success message", async () => {
    SpotifyService.addSongsToPlaylist = vi.fn();
    SpotifyService.addSongsToPlaylist.mockReturnValue("Success");
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      { name: "song1", uri: "uri1" },
      { name: "song2", uri: "uri2" },
    ]);
    expect(dispatch).toHaveBeenCalledWith(
      "setSuccess",
      "Added 'song1', 'song2' to sixSevenEight",
    );
  });
  it("opens the playlist chooser when no playlist is set", async () => {
    state.currentPlaylist.id = undefined;
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      "SongURIString",
      "AnotherSongURI",
    ]);
    expect(dispatch).toHaveBeenCalledWith("choosePlaylist");
    expect(SpotifyService.addSongsToPlaylist).not.toHaveBeenCalled();
  });
  it("errors when no token is provided", async () => {
    rootState.authentication.accessToken = undefined;
    await addSongsToPlaylist({ dispatch, rootState, state }, ["SongURIString"]);
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("no token provided"),
    );
  });
});
describe("loadPlaylist", () => {
  let dispatch;
  let rootState;
  let state;
  let commit;
  beforeEach(() => {
    dispatch = vi.fn();
    commit = vi.fn();
    rootState = {
      playlist: {
        currentPlaylist: {
          id: "12345",
        },
      },
      authentication: {
        accessToken: "TestToken",
      },
      history: {
        historyIndex: 0,
        changes: [{ data: { nodes: [] } }],
      },
    };
    SpotifyService.getSongsFromPlaylist = vi.fn();
    SpotifyService.getSongsFromPlaylist.mockReturnValue({
      items: [
        {
          track: {
            id: "12345",
            metadata: "someMetadata",
          },
        },
      ],
    });
  });
  it("calls Spotify API correctly", async () => {
    await loadPlaylist(
      { dispatch, rootState, commit },
      { id: "12345", name: "testPlaylist" },
    );
    expect(SpotifyService.getSongsFromPlaylist).toHaveBeenCalledWith(
      "TestToken",
      "12345",
    );
  });
  it("adds song nodes to graph", async () => {
    await loadPlaylist(
      { dispatch, rootState, commit },
      { id: "12345", name: "testPlaylist" },
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, "addToGraph", {
      nodes: [
        {
          id: "song/12345",
          data: { sid: "12345", metadata: "someMetadata", label: "song" },
          links: [],
        },
      ],
      links: [],
    });
  });
  it("calls expandAction three times", async () => {
    await loadPlaylist(
      { dispatch, rootState, commit },
      { id: "12345", name: "testPlaylist" },
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      "expandAction",
      expect.any(Object),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      4,
      "expandAction",
      expect.any(Object),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      5,
      "expandAction",
      expect.any(Object),
    );
  });
});

describe("loadPlaylist failure", () => {
  it("keeps the graph and reports the error", async () => {
    const dispatch = vi.fn();
    const commit = vi.fn();
    SpotifyService.getSongsFromPlaylist = vi
      .fn()
      .mockRejectedValue({ response: { status: 404 } });
    await loadPlaylist(
      { dispatch, commit, rootState: { authentication: { accessToken: "t" } } },
      { id: "p1", name: "Mix" },
    );
    expect(commit).not.toHaveBeenCalledWith("CLEAR_GRAPH");
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("The playlist Mix could not be loaded (404)"),
    );
  });
});

describe("choosePlaylist", () => {
  it("opens the playlist window and tells why", () => {
    const dispatch = vi.fn();
    actions.choosePlaylist({ dispatch } as never);
    expect(dispatch).toHaveBeenCalledWith("changePlaylistLoaderState", true);
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      "Choose the playlist that songs go to",
    );
  });
});

describe("saveGraphAsPlaylist", () => {
  const graphWith = async (count: number, label = "song") => {
    const { default: createGraph } = await import("ngraph.graph");
    const graph = createGraph();
    for (let index = 0; index < count; index++)
      graph.addNode(`${label}/${index}`, { label, sid: String(index) });
    graph.addNode("genre/g", { label: "genre" });
    return {
      mainGraph: { Graph: graph },
      spotify: { accessToken: "token" },
      authentication: { loginState: true, accessToken: "token" },
    };
  };

  it("asks for a selection when the graph has too many artists and albums", async () => {
    const dispatch = vi.fn();
    SpotifyService.getSongsFromAlbum = vi.fn();
    const result = await actions.saveGraphAsPlaylist(
      { dispatch, rootState: await graphWith(101, "album") } as never,
      "Mix",
    );
    expect(result).toBeUndefined();
    expect(SpotifyService.getSongsFromAlbum).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      expect.stringContaining("Select up to 100"),
    );
  });

  it("creates a playlist with the songs of the graph, also when there are many", async () => {
    const dispatch = vi.fn().mockResolvedValue({ id: "p" });
    SpotifyService.getFullSongData = vi.fn(
      async (_token: string, ids: string[]) => ({
        tracks: ids.map((id) => ({ id, uri: `spotify:track:${id}`, name: id })),
      }),
    ) as never;
    await actions.saveGraphAsPlaylist(
      { dispatch, rootState: await graphWith(120) } as never,
      "Mix",
    );
    const [, payload] = dispatch.mock.calls.find(
      ([type]) => type === "createPlaylist",
    )!;
    expect(payload.name).toBe("Mix");
    expect(payload.uris).toHaveLength(120);
    expect(payload.uris[0]).toBe("spotify:track:0");
  });
});
