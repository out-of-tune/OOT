import axios from "axios";
import { chunk } from "lodash-es";
import type {
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
}

export default new SpotifyService();
