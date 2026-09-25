import axios from "axios";
import { chunk } from "lodash-es";
import type {
  RepeatState,
  SpotifyDevice,
  SpotifyPlaybackState,
  SpotifyQueue,
  StartPlaybackOptions,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPage,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifySearchResult,
  SpotifyTrack,
  SpotifyUser,
} from "@/types/spotify";

const API = "https://api.spotify.com/v1/";

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

/** Client for the Spotify Web API. Each call takes the access token to use. */
class SpotifyService {
  async getFromAPI<T>(
    url: string,
    token: string,
    params: Record<string, unknown> | null = null,
  ) {
    const response = await axios.get<T>(API + url, {
      headers: authHeaders(token),
      ...(params ? { params } : {}),
    });
    return response.data;
  }

  async sendToAPI<T>(url: string, token: string, body: unknown) {
    const response = await axios.post<T>(encodeURI(API + url), body, {
      headers: authHeaders(token),
    });
    return response.data;
  }

  async putToApi<T>(url: string, token: string, body: unknown) {
    const response = await axios.put<T>(encodeURI(API + url), body, {
      headers: authHeaders(token),
    });
    return response.data;
  }

  /** Follows the `next` links of a paged endpoint and returns all items. */
  private async getAllPages<T>(
    url: string,
    token: string,
    params: Record<string, unknown> = {},
    offset = 0,
  ): Promise<{ items: T[] }> {
    const result = await this.getFromAPI<SpotifyPage<T>>(url, token, {
      ...params,
      offset,
    });
    if (!result.next) return result;
    const nextResult = await this.getAllPages<T>(
      url,
      token,
      params,
      offset + result.limit,
    );
    return { items: [...result.items, ...nextResult.items] };
  }

  getSongSamplesFromArtist(token: string, artistId: string) {
    return this.getFromAPI<{ tracks: SpotifyTrack[] }>(
      `artists/${artistId}/top-tracks`,
      token,
      {
        country: "AT",
      },
    );
  }

  getCurrentUserPlaylists(token: string, limit = 50, offset = 0) {
    return this.getFromAPI<SpotifyPage<SpotifyPlaylist>>(
      "me/playlists",
      token,
      { limit, offset },
    );
  }

  getPlaylist(token: string, uri: string) {
    return this.getFromAPI<SpotifyPlaylist>(`playlists/${uri}`, token);
  }

  getCurrentUserProfile(token: string) {
    return this.getFromAPI<SpotifyUser>("me", token);
  }

  getAlbumsFromArtist(
    token: string,
    sid: string,
    offset = 0,
    includeGroups = "single,album",
  ) {
    return this.getAllPages<SpotifyAlbum>(
      `artists/${sid}/albums`,
      token,
      { include_groups: includeGroups },
      offset,
    );
  }

  getSongsFromAlbum(token: string, sid: string, offset = 0) {
    return this.getAllPages<SpotifyTrack>(
      `albums/${sid}/tracks`,
      token,
      {},
      offset,
    );
  }

  getSongsFromPlaylist(token: string, sid: string, offset = 0) {
    return this.getAllPages<SpotifyPlaylistTrack>(
      `playlists/${sid}/tracks`,
      token,
      {},
      offset,
    );
  }

  getFullSongData(token: string, sids: string[]) {
    return this.getFromAPI<{ tracks: (SpotifyTrack | null)[] }>(
      "tracks/",
      token,
      {
        ids: sids.join(","),
      },
    );
  }

  getArtistsById(token: string, sids: string[]) {
    return this.getFromAPI<{ artists: (SpotifyArtist | null)[] }>(
      "artists/",
      token,
      {
        ids: sids.join(","),
      },
    );
  }

  addSongToPlaylist(token: string, playlistId: string, song: { uri: string }) {
    return this.sendToAPI(`playlists/${playlistId}/tracks`, token, {
      uris: [song.uri],
    });
  }

  /** Spotify accepts at most 100 URIs per request. */
  addSongsToPlaylist(token: string, playlistId: string, songUris: string[]) {
    return Promise.all(
      chunk(songUris, 100).map((uris) =>
        this.sendToAPI(`playlists/${playlistId}/tracks`, token, { uris }),
      ),
    );
  }

  searchByString(
    token: string,
    searchString: string,
    types: string[],
    limit?: number,
  ) {
    return this.getFromAPI<SpotifySearchResult>("search", token, {
      q: searchString,
      type: types.join(","),
      limit,
    });
  }

  play(token: string, uris: string[]) {
    return this.putToApi("me/player/play", token, { uris });
  }

  /** Any Web API call. Returns `null` for "204 No Content". */
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    token: string,
    { params, body }: { params?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T | null> {
    const response = await axios.request<T>({
      method,
      url: API + url,
      headers: authHeaders(token),
      params,
      data: body,
    });
    return response.status === 204 ? null : response.data;
  }

  // Player (Spotify Connect). Without a device id the calls act on the active device.

  getPlaybackState(token: string) {
    return this.request<SpotifyPlaybackState>("GET", "me/player", token);
  }

  startPlayback(
    token: string,
    { deviceId, uris, contextUri, offset, positionMs }: StartPlaybackOptions,
  ) {
    return this.request("PUT", "me/player/play", token, {
      params: deviceId ? { device_id: deviceId } : undefined,
      body: {
        ...(uris ? { uris } : {}),
        ...(contextUri ? { context_uri: contextUri } : {}),
        ...(offset !== undefined ? { offset } : {}),
        ...(positionMs !== undefined ? { position_ms: positionMs } : {}),
      },
    });
  }

  pausePlayback(token: string) {
    return this.request("PUT", "me/player/pause", token);
  }

  skipToNext(token: string) {
    return this.request("POST", "me/player/next", token);
  }

  skipToPrevious(token: string) {
    return this.request("POST", "me/player/previous", token);
  }

  seek(token: string, positionMs: number) {
    return this.request("PUT", "me/player/seek", token, {
      params: { position_ms: Math.round(positionMs) },
    });
  }

  setVolume(token: string, percent: number) {
    return this.request("PUT", "me/player/volume", token, {
      params: { volume_percent: Math.round(percent) },
    });
  }

  setShuffle(token: string, state: boolean) {
    return this.request("PUT", "me/player/shuffle", token, {
      params: { state },
    });
  }

  setRepeat(token: string, state: RepeatState) {
    return this.request("PUT", "me/player/repeat", token, {
      params: { state },
    });
  }

  transferPlayback(token: string, deviceId: string, play: boolean) {
    return this.request("PUT", "me/player", token, {
      body: { device_ids: [deviceId], play },
    });
  }

  async getDevices(token: string) {
    return (
      (
        await this.request<{ devices: SpotifyDevice[] }>(
          "GET",
          "me/player/devices",
          token,
        )
      )?.devices ?? []
    );
  }

  getQueue(token: string) {
    return this.request<SpotifyQueue>("GET", "me/player/queue", token);
  }

  addToPlaybackQueue(token: string, uri: string) {
    return this.request("POST", "me/player/queue", token, { params: { uri } });
  }

  // Library

  async containsSavedTracks(token: string, ids: string[]) {
    return (
      (await this.request<boolean[]>("GET", "me/tracks/contains", token, {
        params: { ids: ids.join(",") },
      })) ?? []
    );
  }

  saveTracks(token: string, ids: string[]) {
    return this.request("PUT", "me/tracks", token, { body: { ids } });
  }

  removeSavedTracks(token: string, ids: string[]) {
    return this.request("DELETE", "me/tracks", token, { body: { ids } });
  }

  getSavedTracks(token: string, limit = 50, offset = 0) {
    return this.getFromAPI<SpotifyPage<{ track: SpotifyTrack }>>(
      "me/tracks",
      token,
      { limit, offset },
    );
  }

  getTopArtists(
    token: string,
    limit = 50,
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  ) {
    return this.getFromAPI<SpotifyPage<SpotifyArtist>>(
      "me/top/artists",
      token,
      { limit, time_range: timeRange },
    );
  }

  getRecentlyPlayed(token: string, limit = 50) {
    return this.getFromAPI<{ items: { track: SpotifyTrack }[] }>(
      "me/player/recently-played",
      token,
      { limit },
    );
  }

  async isFollowingArtists(token: string, ids: string[]) {
    return (
      (await this.request<boolean[]>("GET", "me/following/contains", token, {
        params: { type: "artist", ids: ids.join(",") },
      })) ?? []
    );
  }

  followArtists(token: string, ids: string[]) {
    return this.request("PUT", "me/following", token, {
      params: { type: "artist" },
      body: { ids },
    });
  }

  unfollowArtists(token: string, ids: string[]) {
    return this.request("DELETE", "me/following", token, {
      params: { type: "artist" },
      body: { ids },
    });
  }
}

export default new SpotifyService();
