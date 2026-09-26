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
});
