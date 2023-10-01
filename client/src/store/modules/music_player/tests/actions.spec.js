import { actions } from "../actions";

import SpotifyService from "@/store/services/SpotifyService";
vi.mock("@/store/services/SpotifyService");

const {
  getSongSamples,
  setCurrentSong,
  addToQueue,
  playNextInQueue,
  playPreviousInQueue,
  insertInQueue,
  playSong,
  playAtIndexInQueue,
  retrieveFullSongData,
} = actions;

describe("getSongSamples", () => {
  let commit;
  let rootState;
  let dispatch;
  let node;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    rootState = {
      spotify: {
        accessToken: "IBimsEinsToken",
      },
      authentication: {
        loginState: false,
      },
    };
    node = { id: "Artist/1", data: { label: "artist" } };
  });
  it("updates artist node data", async () => {
    SpotifyService.getSongSamplesFromArtist.mockResolvedValue({
      tracks: ["someData"],
    });
    await getSongSamples({ commit, rootState, dispatch }, node);
    expect(commit).toHaveBeenCalledWith("ADD_NODE_DATA", {
      node: node,
      data: { tracks: ["someData"] },
    });
  });
  it("calls getSongSamplesFromArtist when node is artist", async () => {
    SpotifyService.getSongSamplesFromArtist.mockResolvedValue({
      tracks: ["someData"],
    });
    await getSongSamples({ commit, rootState, dispatch }, node);
    expect(SpotifyService.getSongSamplesFromArtist).toHaveBeenCalled();
  });
  it("updates album node data", async () => {
    node = { id: "album/1", data: { label: "album" } };
    SpotifyService.getSongsFromAlbum.mockResolvedValue({ items: ["someData"] });
    await getSongSamples({ commit, rootState, dispatch }, node);
    expect(commit).toHaveBeenCalledWith("ADD_NODE_DATA", {
      node: node,
      data: { tracks: ["someData"] },
    });
  });
  it("calls getSongsFromAlbum when node is album", async () => {
    node = { id: "album/1", data: { label: "album" } };
    SpotifyService.getSongSamplesFromArtist.mockResolvedValue({
      items: ["someData"],
    });
    await getSongSamples({ commit, rootState, dispatch }, node);
    expect(SpotifyService.getSongsFromAlbum).toHaveBeenCalled();
  });
});
describe("setCurrentSong", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("commits SET_CURRENT_SONG", () => {
    const song = { id: "12" };
    setCurrentSong({ commit }, song);
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_SONG", song);
  });
});
describe("insertInQueue", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("commits SET_CURRENT_SONG", () => {
    const song = { id: "12" };
    insertInQueue({ commit }, { song, position: 1 });
    expect(commit).toHaveBeenCalledWith("INSERT_IN_QUEUE", {
      song,
      position: 1,
    });
  });
});
describe("addToQueue", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("commits ADD_TO_QUEUE", () => {
    const song = { id: "12" };
    addToQueue({ commit }, song);
    expect(commit).toHaveBeenCalledWith("ADD_TO_QUEUE", song);
  });
});
describe("playNextInQueue", () => {
  let dispatch;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    state = {
      queue: [{ el: "one dummy element" }, { el: "two dummy element" }],
      queueIndex: 1,
    };
  });
  it("doesn't do anything when queue index is on the last element", () => {
    playNextInQueue({ dispatch, state });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("sets the current index and song", () => {
    state.queueIndex = 0;
    playNextInQueue({ dispatch, state });
    expect(dispatch).toHaveBeenCalledWith("playAtIndexInQueue", 1);
  });
});
describe("playSong", () => {
  let dispatch;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    state = {
      queue: [],
      queueIndex: 0,
    };
  });
  it("adds song to first place when queue is empty", () => {
    playSong({ dispatch, state }, { el: "one dummy element" });
    expect(dispatch).toHaveBeenNthCalledWith(1, "insertInQueue", {
      song: { el: "one dummy element" },
      position: 0,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, "playAtIndexInQueue", 0);
  });
  it("adds song after the song that is currently playing", () => {
    state.queue = [
      { el: "one dummy element" },
      { el: "two dummy element" },
      { el: "three dummy element" },
    ];
    state.queueIndex = 1;
    playSong({ dispatch, state }, { el: "between to and three dummy element" });
    expect(dispatch).toHaveBeenNthCalledWith(1, "insertInQueue", {
      song: { el: "between to and three dummy element" },
      position: 2,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, "playAtIndexInQueue", 2);
  });
});
describe("playPreviousInQueue", () => {
  let dispatch;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    state = {
      queue: [{ el: "one dummy element" }, { el: "two dummy element" }],
      queueIndex: 1,
    };
  });
  it("doesn't do anything when queue index is on the first element", () => {
    state.queueIndex = 0;
    playPreviousInQueue({ dispatch, state });
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("plays previous song in queue", () => {
    playPreviousInQueue({ dispatch, state });
    expect(dispatch).toHaveBeenCalledWith("playAtIndexInQueue", 0);
  });
});
describe("playAtIndexInQueue", () => {
  let commit;
  let state;
  beforeEach(() => {
    commit = vi.fn();
    state = {
      queue: [{ el: "one dummy element" }, { el: "two dummy element" }],
      queueIndex: 0,
    };
  });
  it("doesn't do anything when queueIndex is bogus", () => {
    playAtIndexInQueue({ commit, state }, 5);
    expect(commit).not.toHaveBeenCalled();
  });
  it("it plays the song and sets the queueIndex", () => {
    playAtIndexInQueue({ commit, state }, 1);
    expect(commit).toHaveBeenNthCalledWith(1, "SET_CURRENT_SONG", {
      el: "two dummy element",
    });
    expect(commit).toHaveBeenNthCalledWith(2, "SET_QUEUE_INDEX", 1);
  });
});
