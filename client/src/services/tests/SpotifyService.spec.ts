import axios from "axios";
import SpotifyService from "../SpotifyService";

vi.mock("axios");

afterEach(() => vi.resetAllMocks());

describe("SpotifyService", () => {
  it("sends reads and writes through one request path", async () => {
    vi.mocked(axios.request)
      .mockResolvedValueOnce({ status: 200, data: { items: [] } })
      .mockResolvedValueOnce({ status: 201, data: { snapshot_id: "s" } });
    await expect(SpotifyService.getSavedTracks("token")).resolves.toEqual({
      items: [],
    });
    await SpotifyService.addSongsToPlaylist("token", "p1", ["spotify:track:1"]);
    expect(vi.mocked(axios.request).mock.calls).toEqual([
      [
        expect.objectContaining({
          method: "GET",
          url: "https://api.spotify.com/v1/me/tracks",
          params: { limit: 50, offset: 0 },
          headers: expect.objectContaining({ Authorization: "Bearer token" }),
        }),
      ],
      [
        expect.objectContaining({
          method: "POST",
          url: "https://api.spotify.com/v1/playlists/p1/items",
          data: { uris: ["spotify:track:1"] },
        }),
      ],
    ]);
  });

  it("returns null for 204 No Content", async () => {
    vi.mocked(axios.request).mockResolvedValue({ status: 204, data: "" });
    await expect(SpotifyService.getPlaybackState("token")).resolves.toBeNull();
  });

  it("creates a private playlist of the user", async () => {
    vi.mocked(axios.request).mockResolvedValue({
      status: 201,
      data: { id: "p1", name: "Mix" },
    });
    await expect(
      SpotifyService.createPlaylist("token", "Mix", { description: "d" }),
    ).resolves.toEqual({ id: "p1", name: "Mix" });
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "https://api.spotify.com/v1/me/playlists",
        data: { name: "Mix", public: false, description: "d" },
      }),
    );
  });

  it("adds more than 100 songs in order, one request after another", async () => {
    const started: number[] = [];
    let release: () => void = () => undefined;
    vi.mocked(axios.request).mockImplementation(((config: {
      data: { uris: string[] };
    }) => {
      started.push(config.data.uris.length);
      return new Promise((resolve) => {
        release = () => resolve({ status: 201, data: {} });
      });
    }) as never);
    const uris = Array.from({ length: 150 }, (_, i) => `spotify:track:${i}`);
    const adding = SpotifyService.addSongsToPlaylist("token", "p1", uris);
    await Promise.resolve();
    expect(started).toEqual([100]);
    release();
    await vi.waitFor(() => expect(started).toEqual([100, 50]));
    release();
    await adding;
  });
});
