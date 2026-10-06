import createGraph from "ngraph.graph";
import { actions, songsForNodes } from "../actions";

import SpotifyService from "@/services/SpotifyService";
vi.mock("@/services/SpotifyService");

const {
  getSongSamples,
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
const previewOnly = { spotify_player: { status: "off" } };
const spotifyReady = { spotify_player: { status: "ready" } };

describe("addToQueue", () => {
  it("adds the one song like a list of songs", () => {
    const dispatch = vi.fn();
    const song = { id: "12", name: "x", images: [] };
    addToQueue({ dispatch }, song);
    expect(dispatch).toHaveBeenCalledWith("addSongsToQueue", [song]);
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
  it("plays the full song on Spotify when the Spotify player is ready", () => {
    playSong(
      { dispatch, state, rootState: spotifyReady },
      { uri: "spotify:track:1" },
    );
    expect(dispatch).toHaveBeenCalledWith("spotifyPlay", {
      uris: ["spotify:track:1"],
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
  it("adds song to first place when queue is empty", () => {
    playSong(
      { dispatch, state, rootState: previewOnly },
      { el: "one dummy element" },
    );
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
    playSong(
      { dispatch, state, rootState: previewOnly },
      { el: "between to and three dummy element" },
    );
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
    playAtIndexInQueue({ commit, dispatch: vi.fn(), state }, 5);
    expect(commit).not.toHaveBeenCalled();
  });
  it("plays the song, sets the queueIndex and lets follow mode move the view", () => {
    const dispatch = vi.fn();
    playAtIndexInQueue({ commit, dispatch, state }, 1);
    expect(commit).toHaveBeenNthCalledWith(1, "SET_CURRENT_SONG", {
      el: "two dummy element",
    });
    expect(commit).toHaveBeenNthCalledWith(2, "SET_QUEUE_INDEX", 1);
    expect(dispatch).toHaveBeenCalledWith("followNowPlaying");
  });
});

describe("songs of nodes", () => {
  const rootState = () => ({
    spotify: { accessToken: "token" },
    authentication: { loginState: false },
    spotify_player: { status: "off" },
  });
  const track = (id: string) => ({
    id,
    uri: `spotify:track:${id}`,
    name: id,
    album: { images: [{ url: `cover-${id}` }] },
  });

  it("gives the song of a song node and a random song of an artist and of an album, in order", async () => {
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [track("s1")],
    } as never);
    vi.mocked(SpotifyService.getSongSamplesFromArtist).mockResolvedValue({
      tracks: [track("a1")],
    } as never);
    vi.mocked(SpotifyService.getSongsFromAlbum).mockResolvedValue({
      items: [{ id: "b1", uri: "spotify:track:b1", name: "b1" }],
    } as never);
    const songs = await songsForNodes(vi.fn(), rootState() as never, [
      { id: "album/b", data: { label: "album", sid: "b", images: ["img"] } },
      { id: "genre/1", data: { label: "genre", name: "rock" } },
      { id: "song/s1", data: { label: "song", sid: "s1" } },
      { id: "artist/a", data: { label: "artist", sid: "a", name: "A" } },
    ]);
    expect(songs.map((song) => song.id)).toEqual(["b1", "s1", "a1"]);
    // Album tracks have no album, so the cover of the album node is used.
    expect(songs[0].images).toEqual([{ url: "img" }]);
    expect(songs[1].images).toEqual([{ url: "cover-s1" }]);
    expect(SpotifyService.getSongSamplesFromArtist).toHaveBeenCalledWith(
      "token",
      "a",
      "A",
    );
  });

  it("leaves out nodes that Spotify has no song for", async () => {
    vi.mocked(SpotifyService.getSongsFromAlbum).mockRejectedValue({
      response: { status: 404 },
    });
    vi.mocked(SpotifyService.getSongSamplesFromArtist).mockResolvedValue({
      tracks: [],
    } as never);
    const songs = await songsForNodes(vi.fn(), rootState() as never, [
      { id: "album/b", data: { label: "album", sid: "b" } },
      { id: "artist/a", data: { label: "artist", sid: "a", name: "A" } },
    ]);
    expect(songs).toEqual([]);
  });

  it("queues the songs of nodes and tells how many", async () => {
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [track("s1"), track("s2")],
    } as never);
    const dispatch = vi.fn().mockResolvedValue(2);
    const queued = await actions.addNodesToQueue(
      { dispatch, rootState: rootState() } as never,
      [
        { id: "song/s1", data: { label: "song", sid: "s1" } },
        { id: "song/s2", data: { label: "song", sid: "s2" } },
      ],
    );
    expect(queued).toBe(2);
    expect(dispatch).toHaveBeenCalledWith("addSongsToQueue", [
      expect.objectContaining({ id: "s1" }),
      expect.objectContaining({ id: "s2" }),
    ]);
    expect(dispatch).toHaveBeenCalledWith(
      "setSuccess",
      "Added 2 songs to the queue",
    );
  });

  it("tells when a node has no song", async () => {
    const dispatch = vi.fn();
    const queued = await actions.addNodesToQueue(
      { dispatch, rootState: rootState() } as never,
      [{ id: "genre/1", data: { label: "genre", name: "rock" } }],
    );
    expect(queued).toBe(0);
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      "Spotify has no song for rock",
    );
  });

  it("adds to the preview queue when the Spotify player is not connected", async () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const songs = [
      { name: "a", images: [] },
      { name: "b", images: [] },
    ];
    await expect(
      actions.addSongsToQueue(
        { commit, dispatch, rootState: rootState() } as never,
        songs,
      ),
    ).resolves.toBe(2);
    expect(commit).toHaveBeenNthCalledWith(1, "ADD_TO_QUEUE", songs[0]);
    expect(commit).toHaveBeenNthCalledWith(2, "ADD_TO_QUEUE", songs[1]);
  });

  it("adds to the Spotify queue in one change when the player is connected", async () => {
    const dispatch = vi.fn().mockResolvedValue(true);
    const songs = [
      { name: "a", uri: "spotify:track:a", images: [] },
      { name: "b", images: [] },
    ];
    await expect(
      actions.addSongsToQueue(
        {
          commit: vi.fn(),
          dispatch,
          rootState: { spotify_player: { status: "ready" } },
        } as never,
        songs,
      ),
    ).resolves.toBe(1);
    expect(dispatch).toHaveBeenCalledWith("addSongsToSpotifyQueue", [songs[0]]);
  });
});

describe("followNowPlaying", () => {
  function followSetup(follow = true) {
    const graph = createGraph();
    graph.addNode("song/s1", { label: "song", sid: "s1", name: "Song" });
    const state = {
      followPlayback: follow,
      currentSong: { name: "" },
    };
    const rootState = {
      mainGraph: { Graph: graph },
      spotify_player: { status: "ready", track: { id: "s1" } },
      spotify: { accessToken: "token" },
      authentication: { loginState: false },
    };
    const commit = vi.fn();
    const dispatch = vi.fn();
    return {
      graph,
      ctx: { state, rootState, commit, dispatch } as never,
      commit,
      dispatch,
      rootState,
    };
  }

  it("moves the view to the song that plays and shows it in the node info", async () => {
    const { ctx, commit, dispatch } = followSetup();
    await actions.followNowPlaying(ctx);
    const node = expect.objectContaining({ id: "song/s1" });
    expect(commit).toHaveBeenCalledWith("SET_CURRENTNODE", node);
    expect(dispatch).toHaveBeenCalledWith("setNodeInfoVisibility", true);
    expect(dispatch).toHaveBeenCalledWith("moveToNode", node);
    expect(dispatch).toHaveBeenCalledWith("loadSongInfo", node);
  });

  it("does nothing when follow mode is off", async () => {
    const { ctx, commit, dispatch } = followSetup(false);
    await actions.followNowPlaying(ctx);
    expect(commit).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("adds a song that is not in the graph", async () => {
    const { ctx, rootState, dispatch, graph } = followSetup();
    rootState.spotify_player.track = { id: "s2" };
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [{ id: "s2", name: "Two" }],
    } as never);
    dispatch.mockImplementation((type: string, payload: never) => {
      if (type === "addToGraph")
        (payload as { nodes: { id: string; data: object }[] }).nodes.forEach(
          (node) => graph.addNode(node.id, node.data as never),
        );
      return Promise.resolve({ nodes: [], links: [] });
    });
    await actions.followNowPlaying(ctx);
    expect(dispatch).toHaveBeenCalledWith(
      "moveToNode",
      expect.objectContaining({ id: "song/s2" }),
    );
  });
});

describe("loadSongInfo and songAction", () => {
  const node = { id: "song/s1", data: { label: "song", sid: "s1" } };
  const rootState = (currentId: string) => ({
    spotify: { accessToken: "token" },
    authentication: { loginState: false },
    mainGraph: { currentNode: { id: currentId } },
  });

  it("shows the full track when the panel still shows the node, and returns it", async () => {
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [{ id: "s1", name: "One", album: { images: [{ url: "c" }] } }],
    } as never);
    const commit = vi.fn();
    const data = await actions.loadSongInfo(
      { commit, dispatch: vi.fn(), rootState: rootState("song/s1") } as never,
      node,
    );
    expect(data).toEqual(
      expect.objectContaining({ name: "One", images: [{ url: "c" }] }),
    );
    expect(commit).toHaveBeenCalledWith("ADD_NODE_DATA", { node, data });
  });

  it("does not replace the panel when it shows another node meanwhile", async () => {
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [{ id: "s1", name: "One" }],
    } as never);
    const commit = vi.fn();
    await actions.loadSongInfo(
      {
        commit,
        dispatch: vi.fn(),
        rootState: rootState("song/other"),
      } as never,
      node,
    );
    expect(commit).not.toHaveBeenCalled();
  });

  it("reports a song that could not load", async () => {
    vi.mocked(SpotifyService.getFullSongData).mockRejectedValue({
      response: { status: 500 },
    });
    const dispatch = vi.fn();
    const data = await actions.loadSongInfo(
      { commit: vi.fn(), dispatch, rootState: rootState("song/s1") } as never,
      node,
    );
    expect(data).toBeUndefined();
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("The song could not be loaded (500)"),
    );
  });

  it("runs the song action with the loaded track", async () => {
    const data = { name: "One" };
    const dispatch = vi.fn((type: string) =>
      type === "loadSongInfo" ? Promise.resolve(data) : undefined,
    );
    await actions.songAction(
      { dispatch, state: { songAction: "addToQueue" } } as never,
      node,
    );
    expect(dispatch).toHaveBeenCalledWith("addToQueue", data);
  });
});

describe("flashQueueBadge", () => {
  it("shows the badge for a moment", () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    actions.flashQueueBadge({ dispatch } as never);
    expect(dispatch).toHaveBeenCalledWith("setAddToQueueNotifaction", true);
    vi.advanceTimersByTime(500);
    expect(dispatch).toHaveBeenLastCalledWith(
      "setAddToQueueNotifaction",
      false,
    );
    vi.useRealTimers();
  });
});
