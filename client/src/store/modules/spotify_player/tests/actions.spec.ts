// @vitest-environment jsdom
import { createSpotifyPlayer } from "@/lib/spotifyPlayer";
import SpotifyService from "@/services/SpotifyService";
import { initialSpotifyPlayerState } from "../index";
import mutations from "../mutations";
import { actions } from "../actions";

vi.mock("@/lib/spotifyPlayer");
vi.mock("@/services/SpotifyService");

function fakePlayer() {
  return {
    togglePlay: vi.fn().mockResolvedValue(undefined),
    nextTrack: vi.fn().mockResolvedValue(undefined),
    previousTrack: vi.fn().mockResolvedValue(undefined),
    seek: vi.fn().mockResolvedValue(undefined),
    setVolume: vi.fn().mockResolvedValue(undefined),
    activateElement: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
  };
}

/** A context whose commits run the real mutations. */
function setup({ loggedIn = true, product = "premium" } = {}) {
  const state = initialSpotifyPlayerState();
  const rootState = {
    authentication: { loginState: loggedIn, accessToken: "token" },
    user: { me: { product } },
    spotify_player: state,
  };
  const commit = vi.fn((type: string, payload?: unknown) =>
    (mutations as Record<string, (s: typeof state, p?: unknown) => void>)[
      type
    ]?.(state, payload),
  );
  const dispatch = vi.fn();
  return {
    state,
    rootState,
    commit,
    dispatch,
    ctx: { state, rootState, commit, dispatch } as never,
  };
}

const sdkState = (overrides = {}) => ({
  paused: false,
  position: 1000,
  duration: 200000,
  shuffle: true,
  repeat_mode: 2,
  track_window: {
    current_track: {
      id: "t1",
      uri: "spotify:track:t1",
      name: "Song",
      duration_ms: 200000,
      artists: [{ name: "Artist", uri: "spotify:artist:a1" }],
      album: {
        name: "Album",
        uri: "spotify:album:b1",
        images: [{ url: "cover" }],
      },
    },
  },
  ...overrides,
});

afterEach(async () => {
  // The SDK player lives in the module, so each test disconnects it.
  await actions.disconnectSpotifyPlayer({ commit: vi.fn() } as never);
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("connectSpotifyPlayer", () => {
  it("does nothing when the user is not logged in", async () => {
    const { ctx, state } = setup({ loggedIn: false });
    await actions.connectSpotifyPlayer(ctx);
    expect(createSpotifyPlayer).not.toHaveBeenCalled();
    expect(state.status).toBe("off");
  });

  it("needs Spotify Premium", async () => {
    const { ctx, state } = setup({ product: "free" });
    await actions.connectSpotifyPlayer(ctx);
    expect(createSpotifyPlayer).not.toHaveBeenCalled();
    expect(state.status).toBe("premium_required");
  });

  it("becomes ready with the device id of this tab", async () => {
    const { ctx, state, dispatch } = setup();
    vi.mocked(createSpotifyPlayer).mockImplementation(
      async (_token, callbacks) => {
        callbacks.onReady("device-1");
        return fakePlayer() as never;
      },
    );
    await actions.connectSpotifyPlayer(ctx);
    expect(state.status).toBe("ready");
    expect(state.deviceId).toBe("device-1");
    expect(dispatch).toHaveBeenCalledWith("startRemotePolling");
  });

  it("gives the SDK the current user token", async () => {
    const { ctx, rootState } = setup();
    let getToken: () => string = () => "";
    vi.mocked(createSpotifyPlayer).mockImplementation(async (token) => {
      getToken = token;
      return fakePlayer() as never;
    });
    await actions.connectSpotifyPlayer(ctx);
    rootState.authentication.accessToken = "newer";
    expect(getToken()).toBe("newer");
  });

  it("is unavailable when the SDK fails", async () => {
    const { ctx, state } = setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(createSpotifyPlayer).mockRejectedValue(new Error("no DRM"));
    await actions.connectSpotifyPlayer(ctx);
    expect(state.status).toBe("unavailable");
  });

  it("reports an account error as premium required", async () => {
    const { ctx, state } = setup({ product: "" });
    vi.mocked(createSpotifyPlayer).mockImplementation(
      async (_token, callbacks) => {
        callbacks.onError("account", "Premium required");
        return fakePlayer() as never;
      },
    );
    await actions.connectSpotifyPlayer(ctx);
    expect(state.status).toBe("premium_required");
  });
});

describe("applySdkState", () => {
  it("shows the track of this tab", () => {
    const { ctx, state, dispatch } = setup();
    actions.applySdkState(ctx, sdkState() as never);
    expect(state.track).toMatchObject({
      id: "t1",
      name: "Song",
      artists: [{ name: "Artist", id: "a1" }],
      albumName: "Album",
      durationMs: 200000,
    });
    expect(state).toMatchObject({
      paused: false,
      positionMs: 1000,
      shuffle: true,
      repeat: "track",
      isLocal: true,
    });
    expect(dispatch).toHaveBeenCalledWith("checkLiked");
  });

  it("reads the other device when this tab stops playing", () => {
    const { ctx, state, dispatch } = setup();
    actions.applySdkState(ctx, sdkState() as never);
    actions.applySdkState(ctx, null);
    expect(state.isLocal).toBe(false);
    expect(dispatch).toHaveBeenCalledWith("refreshPlaybackState");
  });
});

describe("refreshPlaybackState", () => {
  it("shows the playback of another device", async () => {
    const { ctx, state } = setup();
    state.deviceId = "this-tab";
    vi.mocked(SpotifyService.getPlaybackState).mockResolvedValue({
      device: { id: "phone", name: "Phone", volume_percent: 30 },
      is_playing: true,
      progress_ms: 5000,
      shuffle_state: false,
      repeat_state: "context",
      item: {
        id: "t2",
        name: "Other",
        uri: "spotify:track:t2",
        duration_ms: 1000,
      },
    } as never);
    await actions.refreshPlaybackState(ctx);
    expect(state).toMatchObject({
      isLocal: false,
      remoteDeviceName: "Phone",
      paused: false,
      positionMs: 5000,
      repeat: "context",
      volume: 30,
    });
    expect(state.track?.id).toBe("t2");
  });
});

describe("refreshPlaybackState without playback", () => {
  it("forgets the other device, so the next play goes to this tab", async () => {
    const { ctx, state } = setup();
    state.remoteDeviceName = "Phone";
    vi.mocked(SpotifyService.getPlaybackState).mockResolvedValue(null);
    await actions.refreshPlaybackState(ctx);
    expect(state.remoteDeviceName).toBeNull();
    expect(state.paused).toBe(true);
  });
});

describe("library", () => {
  it("likes the song by its URI", async () => {
    const { ctx, state } = setup();
    state.track = { id: "t1" } as never;
    vi.mocked(SpotifyService.saveToLibrary).mockResolvedValue([null]);
    await actions.toggleSpotifyLiked(ctx);
    expect(SpotifyService.saveToLibrary).toHaveBeenCalledWith("token", [
      "spotify:track:t1",
    ]);
    expect(state.liked).toBe(true);
  });

  it("follows an artist by its URI and reports a failure", async () => {
    const { ctx } = setup();
    vi.mocked(SpotifyService.saveToLibrary).mockRejectedValue({
      response: { status: 403 },
    });
    const done = await actions.followSpotifyArtist(ctx, {
      sid: "a1",
      follow: true,
    });
    expect(SpotifyService.saveToLibrary).toHaveBeenCalledWith("token", [
      "spotify:artist:a1",
    ]);
    expect(done).toBe(false);
  });
});

describe("controls", () => {
  async function connected() {
    const context = setup();
    const player = fakePlayer();
    vi.mocked(createSpotifyPlayer).mockImplementation(
      async (_token, callbacks) => {
        callbacks.onReady("device-1");
        return player as never;
      },
    );
    await actions.connectSpotifyPlayer(context.ctx);
    return { ...context, player };
  }

  it("uses the SDK while this tab plays", async () => {
    const { ctx, state, player } = await connected();
    state.isLocal = true;
    await actions.spotifyTogglePlay(ctx);
    await actions.spotifyNext(ctx);
    await actions.spotifySetVolume(ctx, 40);
    expect(player.togglePlay).toHaveBeenCalled();
    expect(player.nextTrack).toHaveBeenCalled();
    expect(player.setVolume).toHaveBeenCalledWith(0.4);
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
  });

  it("uses the Web API while another device plays", async () => {
    const { ctx, state } = await connected();
    state.isLocal = false;
    state.paused = true;
    await actions.spotifyTogglePlay(ctx);
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith("token", {});
    expect(state.paused).toBe(false);
  });

  it("plays on this tab when no other device plays", async () => {
    const { ctx } = await connected();
    await actions.spotifyPlay(ctx, { uris: ["spotify:track:1"] });
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith("token", {
      uris: ["spotify:track:1"],
      deviceId: "device-1",
    });
  });

  it("cycles repeat off, context, track", async () => {
    const { ctx, state } = setup();
    await actions.spotifyCycleRepeat(ctx);
    expect(state.repeat).toBe("context");
    await actions.spotifyCycleRepeat(ctx);
    expect(state.repeat).toBe("track");
    await actions.spotifyCycleRepeat(ctx);
    expect(state.repeat).toBe("off");
    expect(SpotifyService.setRepeat).toHaveBeenLastCalledWith("token", "off");
  });

  it("refreshes the token once after a 401", async () => {
    const { ctx, rootState, dispatch } = setup();
    dispatch.mockImplementation(async (type: string) => {
      if (type === "refreshToken")
        rootState.authentication.accessToken = "fresh";
    });
    vi.mocked(SpotifyService.setShuffle)
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce(null);
    await actions.spotifyToggleShuffle(ctx);
    expect(dispatch).toHaveBeenCalledWith("refreshToken");
    expect(SpotifyService.setShuffle).toHaveBeenLastCalledWith("fresh", true);
  });

  it("explains a missing device", async () => {
    const { ctx, dispatch } = setup();
    vi.mocked(SpotifyService.skipToNext).mockRejectedValue({
      response: { status: 404 },
    });
    await actions.spotifyNext(ctx);
    const error = dispatch.mock.calls.find(
      ([type]) => type === "setError",
    )?.[1];
    expect(String(error)).toContain("No active Spotify device");
  });

  it("takes the like back when saving fails", async () => {
    const { ctx, state } = setup();
    state.track = { id: "t1" } as never;
    vi.mocked(SpotifyService.saveToLibrary).mockRejectedValue({
      response: { status: 500 },
    });
    await actions.toggleSpotifyLiked(ctx);
    expect(state.liked).toBe(false);
  });

  it("forgets the device on disconnect", async () => {
    const { ctx, state, player } = await connected();
    await actions.disconnectSpotifyPlayer(ctx);
    expect(player.disconnect).toHaveBeenCalled();
    expect(state.status).toBe("off");
    expect(state.deviceId).toBeNull();
  });
});

describe("connect and disconnect", () => {
  it("drops a player that connects after a logout", async () => {
    const { ctx, state, dispatch } = setup();
    const player = fakePlayer();
    let finish: () => void = () => undefined;
    vi.mocked(createSpotifyPlayer).mockImplementation(
      (_token, callbacks) =>
        new Promise((resolve) => {
          finish = () => {
            callbacks.onReady("device-1");
            resolve(player as never);
          };
        }),
    );
    const connecting = actions.connectSpotifyPlayer(ctx);
    await actions.disconnectSpotifyPlayer(ctx);
    finish();
    await connecting;
    expect(player.disconnect).toHaveBeenCalled();
    expect(state.status).toBe("off");
    expect(dispatch).not.toHaveBeenCalledWith("startRemotePolling");
  });

  it("gives up after an authentication error, so a later connect can try again", async () => {
    const { ctx, state, dispatch } = setup();
    dispatch.mockResolvedValue(undefined);
    const player = fakePlayer();
    vi.mocked(createSpotifyPlayer).mockImplementationOnce(
      async (_token, callbacks) => {
        callbacks.onError("authentication", "Invalid token scopes.");
        return player as never;
      },
    );
    await actions.connectSpotifyPlayer(ctx);
    expect(state.status).toBe("unavailable");
    expect(player.disconnect).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith("refreshToken");

    vi.mocked(createSpotifyPlayer).mockResolvedValueOnce(fakePlayer() as never);
    await actions.connectSpotifyPlayer(ctx);
    expect(createSpotifyPlayer).toHaveBeenCalledTimes(2);
  });
});

describe("position", () => {
  it("keeps the position that was reached when another device pauses", () => {
    vi.useFakeTimers();
    const { state, commit } = setup();
    state.track = { id: "t1", durationMs: 200000 } as never;
    commit("SET_SPOTIFY_PLAYBACK", {
      ...state,
      paused: false,
      positionMs: 10000,
    });
    vi.advanceTimersByTime(3000);
    commit("SET_SPOTIFY_PAUSED", true);
    expect(state.positionMs).toBe(13000);
  });
});

describe("library graphs", () => {
  it("keeps the graph when Spotify fails", async () => {
    const { ctx, commit, dispatch } = setup();
    vi.mocked(SpotifyService.getSavedTracks).mockRejectedValue({
      response: { status: 500 },
    });
    await actions.loadLikedSongsGraph(ctx);
    expect(commit).not.toHaveBeenCalledWith("CLEAR_GRAPH");
    expect(dispatch).toHaveBeenCalledWith("setError", expect.any(Error));
    expect(dispatch).not.toHaveBeenCalledWith("setInfo", expect.anything());
  });

  it("replaces the graph and fits it", async () => {
    const { ctx, commit, dispatch } = setup();
    vi.mocked(SpotifyService.getRecentlyPlayed).mockResolvedValue({
      items: [{ track: { id: "s1", name: "Song" } }],
    } as never);
    await actions.loadRecentlyPlayedGraph(ctx);
    expect(commit).toHaveBeenCalledWith("CLEAR_GRAPH");
    expect(dispatch).toHaveBeenCalledWith("addToGraph", expect.anything());
    expect(dispatch).toHaveBeenLastCalledWith("fitGraphToScreen");
  });
});

describe("queue changes", () => {
  const song = (id: string) => ({
    id,
    uri: `spotify:track:${id}`,
    name: id,
    artists: [],
    albumName: "",
    images: [],
    durationMs: 300000,
  });

  /** A context whose dispatch runs the queue actions, so a change goes all the way to Spotify. */
  function queueSetup() {
    const context = setup();
    const routed = [
      "addSongsToSpotifyQueue",
      "setSpotifyQueue",
      "syncSpotifyQueue",
      "removeFromSpotifyQueue",
      "loadSpotifyQueue",
    ];
    context.dispatch.mockImplementation(((type: string, payload?: unknown) =>
      routed.includes(type)
        ? (
            actions as unknown as Record<
              string,
              (ctx: unknown, payload?: unknown) => unknown
            >
          )[type](context.ctx, payload)
        : undefined) as never);
    Object.assign(context.state, {
      track: song("now"),
      queue: [song("a"), song("b"), song("c")],
      paused: false,
      positionMs: 42000,
      positionAt: Date.now(),
      deviceId: "tab",
    });
    vi.mocked(SpotifyService.startPlayback).mockResolvedValue(null);
    vi.mocked(SpotifyService.getQueue).mockResolvedValue({
      queue: [],
    } as never);
    return context;
  }

  beforeEach(() => vi.useFakeTimers());

  it("removes a song: the list changes at once, then plays the song that plays again with the new list", async () => {
    const { ctx, state } = queueSetup();
    const removing = actions.removeFromSpotifyQueue(ctx, 1);
    expect(state.queue.map((entry) => entry.id)).toEqual(["a", "c"]);
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    await expect(removing).resolves.toBe(true);
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith("token", {
      deviceId: "tab",
      uris: ["spotify:track:now", "spotify:track:a", "spotify:track:c"],
      positionMs: 42300,
    });
    expect(SpotifyService.pausePlayback).not.toHaveBeenCalled();
  });

  it("sends quick changes in one request", async () => {
    const { ctx } = queueSetup();
    actions.removeFromSpotifyQueue(ctx, 0);
    actions.removeFromSpotifyQueue(ctx, 0);
    const last = actions.setSpotifyQueue(ctx, []);
    await vi.advanceTimersByTimeAsync(300);
    await last;
    expect(SpotifyService.startPlayback).toHaveBeenCalledTimes(1);
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({ uris: ["spotify:track:now"] }),
    );
  });

  it("keeps a paused song paused and turns shuffle off", async () => {
    const { ctx, state, dispatch } = queueSetup();
    state.paused = true;
    state.shuffle = true;
    const moving = actions.setSpotifyQueue(ctx, [song("c"), song("a")]);
    await vi.advanceTimersByTimeAsync(300);
    await moving;
    expect(SpotifyService.setShuffle).toHaveBeenCalledWith("token", false);
    expect(state.shuffle).toBe(false);
    expect(dispatch).toHaveBeenCalledWith(
      "setInfo",
      "Shuffle is off, so the queue keeps your order",
    );
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        uris: ["spotify:track:now", "spotify:track:c", "spotify:track:a"],
        positionMs: 42000,
      }),
    );
    expect(SpotifyService.pausePlayback).toHaveBeenCalled();
  });

  it("adds songs to the end, then reloads the queue from Spotify", async () => {
    const { ctx, state, dispatch } = queueSetup();
    const adding = actions.addSongsToSpotifyQueue(ctx, [
      { id: "d", uri: "spotify:track:d", name: "d", images: [] },
      { name: "no uri", images: [] },
    ]);
    expect(state.queue.map((entry) => entry.id)).toEqual(["a", "b", "c", "d"]);
    expect(dispatch).not.toHaveBeenCalledWith("flashQueueBadge");
    await vi.advanceTimersByTimeAsync(300);
    await expect(adding).resolves.toBe(true);
    expect(dispatch).toHaveBeenCalledWith("flashQueueBadge");
    expect(SpotifyService.addToPlaybackQueue).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(800);
    expect(SpotifyService.getQueue).toHaveBeenCalled();
  });

  it("uses the queue of Spotify when no song is loaded", async () => {
    const { ctx, state } = queueSetup();
    state.track = null;
    state.queue = [];
    vi.mocked(SpotifyService.addToPlaybackQueue).mockResolvedValue(null);
    await expect(
      actions.addSongsToSpotifyQueue(ctx, [
        { uri: "spotify:track:d", name: "d", images: [] },
      ]),
    ).resolves.toBe(true);
    expect(SpotifyService.addToPlaybackQueue).toHaveBeenCalledWith(
      "token",
      "spotify:track:d",
    );
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
    expect(state.queue.map((entry) => entry.uri)).toEqual(["spotify:track:d"]);
  });

  it("reports a refused change and loads the real queue again", async () => {
    const { ctx, dispatch } = queueSetup();
    vi.mocked(SpotifyService.startPlayback).mockRejectedValue({
      response: { status: 403, data: { error: { message: "Restricted" } } },
    });
    const removing = actions.removeFromSpotifyQueue(ctx, 0);
    await vi.advanceTimersByTimeAsync(300);
    await expect(removing).resolves.toBe(false);
    expect(dispatch).toHaveBeenCalledWith("setError", new Error("Restricted"));
    await vi.advanceTimersByTimeAsync(800);
    expect(SpotifyService.getQueue).toHaveBeenCalled();
  });

  it("does not replace a change that is not at Spotify yet with the old queue", async () => {
    const { ctx, state } = queueSetup();
    vi.mocked(SpotifyService.getQueue).mockResolvedValue({
      queue: [{ id: "old", uri: "spotify:track:old", name: "old" }],
    } as never);
    const removing = actions.removeFromSpotifyQueue(ctx, 0);
    await actions.loadSpotifyQueue(ctx);
    expect(state.queue.map((entry) => entry.id)).toEqual(["b", "c"]);
    await vi.advanceTimersByTimeAsync(300);
    await removing;
  });
});

describe("follow mode", () => {
  it("lets follow mode move the view when the song changes", () => {
    const { ctx, dispatch } = setup();
    actions.applySdkState(ctx, sdkState() as never);
    expect(dispatch).toHaveBeenCalledWith("followNowPlaying");
    dispatch.mockClear();
    actions.applySdkState(ctx, sdkState({ position: 5000 }) as never);
    expect(dispatch).not.toHaveBeenCalledWith("followNowPlaying");
  });
});
