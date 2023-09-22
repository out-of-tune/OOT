global.expect = require("expect");
import SpotifyService from "@/store/services/SpotifyService";
import "babel-polyfill";
jest.mock("@/store/services/SpotifyService");
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
    let commit = jest.fn();
    let modalState = true;
    changePlaylistLoaderState({ commit }, modalState);
    expect(commit).toHaveBeenCalledWith("CHANGE_PLAYLIST_LOADER_STATE", true);
  });
});

describe("getCurrentUsersPlaylists", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
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
  let commit = jest.fn();
  let playlist = { name: "playlist 1" };
  it("sets current playlist", () => {
    setCurrentPlaylist({ commit }, playlist);
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_PLAYLIST", {
      name: "playlist 1",
    });
  });
});
describe("addSongToPlaylist", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn();
  });
  it("calls add songs to playlist", async () => {
    SpotifyService.addSongToPlaylist = jest.fn();
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
    dispatch = jest.fn();
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
    SpotifyService.addSongsToPlaylist = jest.fn();
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      "SongURIString",
      "AnotherSongURI",
    ]);
    expect(SpotifyService.addSongsToPlaylist).toHaveBeenCalledWith(
      "TestToken",
      "12345",
      ["SongURIString", "AnotherSongURI"],
    );
  });
  it("sets success message", async () => {
    SpotifyService.addSongsToPlaylist = jest.fn();
    SpotifyService.addSongsToPlaylist.mockReturnValue("Success");
    await addSongsToPlaylist({ dispatch, rootState, state }, [
      "SongURIString",
      "AnotherSongURI",
    ]);
    expect(dispatch).toHaveBeenCalledWith(
      "setMessage",
      "Added 2 songs to sixSevenEight",
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
    dispatch = jest.fn();
    commit = jest.fn();
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
    SpotifyService.getSongsFromPlaylist = jest.fn();
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
    await loadPlaylist({ dispatch, rootState, commit }, "12345");
    expect(SpotifyService.getSongsFromPlaylist).toHaveBeenCalledWith(
      "TestToken",
      "12345",
    );
  });
  it("adds song nodes to graph", async () => {
    await loadPlaylist({ dispatch, rootState, commit }, "12345");
    expect(dispatch).toHaveBeenNthCalledWith(1, "addToGraph", {
      nodes: [
        {
          id: "Song/12345",
          data: { sid: "12345", metadata: "someMetadata", label: "song" },
          links: [],
        },
      ],
      links: [],
    });
  });
  it("calls expandAction three times", async () => {
    await loadPlaylist({ dispatch, rootState, commit }, "12345");
    expect(dispatch).toHaveBeenCalledTimes(4);
  });
});
