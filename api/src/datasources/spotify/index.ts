import { delay } from "../../helpers/delay.js";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";
/** First wait before a failed token request is retried, in milliseconds. It doubles up to the maximum. */
const TOKEN_RETRY_DELAY = 1000;
const TOKEN_RETRY_MAX_DELAY = 60_000;

export interface ArtistInfo {
  name: string;
  genres: string[];
  popularity: number;
  images: string[];
}

interface SpotifyArtistResponse {
  name: string;
  genres: string[];
  popularity: number;
  images: { url: string }[];
}

export class SpotifyRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Spotify request failed (${status}): ${body}`);
  }
}

/**
 * Spotify client with an app (client credentials) token.
 * The token renews itself at half of its lifetime.
 */
class SpotifyAPI {
  private accessToken = "";
  private stopped = false;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  start() {
    void this.renewTokenLoop();
  }

  stop() {
    this.stopped = true;
  }

  private async renewTokenLoop() {
    let retryDelay = TOKEN_RETRY_DELAY;
    while (!this.stopped) {
      try {
        const expiresIn = await this.fetchToken();
        retryDelay = TOKEN_RETRY_DELAY;
        await delay(expiresIn * 500);
      } catch (error) {
        console.log(
          `Could not fetch the Spotify token: ${(error as Error).message}. Retrying in ${retryDelay / 1000}s...`,
        );
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, TOKEN_RETRY_MAX_DELAY);
      }
    }
  }

  /** Gets a new token. Returns its lifetime in seconds. */
  private async fetchToken(): Promise<number> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    if (!response.ok) throw new SpotifyRequestError(response.status, await response.text());
    const result = (await response.json()) as { access_token: string; expires_in: number };
    this.accessToken = result.access_token;
    console.log("Loaded Spotify token");
    return result.expires_in;
  }

  getToken() {
    return { token: this.accessToken };
  }

  async artist_info(sid: string): Promise<ArtistInfo> {
    const response = await fetch(`${API_URL}/artists/${encodeURIComponent(sid)}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok) throw new SpotifyRequestError(response.status, await response.text());
    const artist = (await response.json()) as SpotifyArtistResponse;
    return {
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      images: artist.images.map((image) => image.url),
    };
  }
}

export default SpotifyAPI;
