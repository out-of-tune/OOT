// @vitest-environment jsdom
import { flushPromises, mount } from "@vue/test-utils";
import type { Store } from "vuex";
import SpotifyService from "@/services/SpotifyService";
import type { RootState } from "@/store/types";
import type { Song } from "@/types/spotify";

// UI tests of the queue: the real store and components, with Spotify replaced by mocks.
vi.mock("@/services/SpotifyService");
vi.mock("@/lib/spotifyPlayer");

const track = (id: string) => ({
  id,
  uri: `spotify:track:${id}`,
  name: `Song ${id}`,
  artists: [{ id: `artist-${id}`, name: `Artist ${id}` }],
  album: { id: `album-${id}`, name: "Album", images: [] },
  duration_ms: 200000,
});
const song = (id: string): Song => ({ ...track(id), images: [] });

/** A fresh store and the queue components, so no test sees the queue of another. */
async function setup({ spotifyReady = true } = {}) {
  vi.resetModules();
  const { store, key } = await import("@/store");
  const { default: QueuePanel } = await import("../QueuePanel.vue");
  const { default: SelectionActions } =
    await import("@/components/popovers/SelectionActions.vue");
  store.commit("SET_LOGIN_STATE", true);
  store.commit("SET_ACCESS_TOKEN", "token");
  if (spotifyReady) {
    store.commit("SET_SPOTIFY_PLAYER_STATUS", "ready");
    store.commit("SET_SPOTIFY_DEVICE_ID", "tab");
    store.commit("SET_SPOTIFY_PLAYBACK", {
      track: {
        id: "now",
        uri: "spotify:track:now",
        name: "Now",
        artists: [],
        albumName: "",
        images: [],
        durationMs: 200000,
      },
      paused: false,
      positionMs: 1000,
      shuffle: false,
      repeat: "off",
      isLocal: true,
      remoteDeviceName: null,
    });
  }
  const global = { plugins: [[store, key] as [Store<RootState>, symbol]] };
  const panel = mount(QueuePanel, { global, attachTo: document.body });
  return { store, panel, global, SelectionActions };
}

/** The song names that the queue panel lists. */
const listed = (panel: ReturnType<typeof mount>) =>
  panel.findAll("li .text-fg.block").map((name) => name.text());

const button = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.get(`button[aria-label="${label}"]`);

/** Lets the queue reach Spotify, and a Spotify state event or a reload arrive. */
const settle = async () => {
  await vi.advanceTimersByTimeAsync(5000);
  await flushPromises();
};

beforeEach(() => {
  vi.useFakeTimers();
  // The mutations of other tabs are not part of these tests.
  vi.stubGlobal("BroadcastChannel", undefined);
  vi.mocked(SpotifyService.startPlayback).mockResolvedValue(null);
  vi.mocked(SpotifyService.addToPlaybackQueue).mockResolvedValue(null);
  vi.mocked(SpotifyService.getPlaybackState).mockResolvedValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("the Spotify queue panel", () => {
  it("shows added songs at once, and adding does not restart the song that plays", async () => {
    const { store, panel } = await setup();
    store.dispatch("addSongsToQueue", [song("a")]);
    await flushPromises();
    expect(listed(panel)).toEqual(["Song a"]);
    store.dispatch("addSongsToQueue", [song("b"), song("c")]);
    await settle();
    expect(listed(panel)).toEqual(["Song a", "Song b", "Song c"]);
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
    expect(SpotifyService.addToPlaybackQueue).toHaveBeenCalledTimes(1);
  });

  it("stays empty after the queue is cleared", async () => {
    const { store, panel } = await setup();
    store.dispatch("addSongsToQueue", [song("a"), song("b")]);
    await settle();
    await button(panel, "Clear queue").trigger("click");
    await settle();
    expect(listed(panel)).toEqual([]);
    expect(panel.text()).toContain("Nothing up next.");
  });

  it("plays a clicked song and keeps the songs after it", async () => {
    const { store, panel } = await setup();
    store.dispatch("addSongsToQueue", [song("a"), song("b"), song("c")]);
    await settle();
    await panel.findAll("button[title='Play now']")[1].trigger("click");
    await settle();
    expect(SpotifyService.startPlayback).toHaveBeenCalledWith("token", {
      deviceId: "tab",
      uris: ["spotify:track:b"],
    });
    expect(listed(panel)).toEqual(["Song c"]);
  });

  it("removes one song", async () => {
    const { store, panel } = await setup();
    store.dispatch("addSongsToQueue", [song("a"), song("b"), song("c")]);
    await settle();
    await panel.findAll("button[aria-label='Remove']")[1].trigger("click");
    await settle();
    expect(listed(panel)).toEqual(["Song a", "Song c"]);
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
  });

  it("takes the songs of the selection", async () => {
    const { store, panel, global, SelectionActions } = await setup();
    vi.mocked(SpotifyService.getFullSongData).mockResolvedValue({
      tracks: [track("s1")],
    } as never);
    vi.mocked(SpotifyService.getSongSamplesFromArtist).mockResolvedValue({
      tracks: [track("x1")],
    } as never);
    store.commit("SET_SELECTED_NODES", [
      { id: "song/s1", data: { label: "song", sid: "s1", name: "Song s1" } },
      { id: "artist/x", data: { label: "artist", sid: "x", name: "X" } },
      { id: "genre/g", data: { label: "genre", name: "G" } },
    ]);
    const actions = mount(SelectionActions, { global });
    const add = actions
      .findAll("button")
      .find((element) => element.text() === "Add songs to queue");
    await add?.trigger("click");
    await settle();
    expect(listed(panel)).toEqual(["Song s1", "Song x1"]);
  });
});

describe("the preview queue panel", () => {
  it("lists, plays and clears the songs without Spotify", async () => {
    const { store, panel } = await setup({ spotifyReady: false });
    store.dispatch("addSongsToQueue", [song("a"), song("b")]);
    await flushPromises();
    expect(listed(panel)).toEqual(["Song a", "Song b"]);
    await panel.findAll("button[title='Play now']")[1].trigger("click");
    expect(store.state.music_player.currentSong.name).toBe("Song b");
    await button(panel, "Clear queue").trigger("click");
    expect(listed(panel)).toEqual([]);
    expect(SpotifyService.startPlayback).not.toHaveBeenCalled();
  });
});
