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
    await getCurrentUsersPlaylists({ commit, rootState });
    expect(commit).toHaveBeenCalledWith("SET_USER_PLAYLISTS", [
      { name: "playlist 1" },
      { name: "playlist 2" },
    ]);
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
  it("errors when no playlist is set", async () => {
    state.currentPlaylist.id = undefined;
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      "SongURIString",
      "AnotherSongURI",
    ]);
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("no playlist is chosen"),
    );
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
