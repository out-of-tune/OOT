import { delay } from "../../helpers/delay.js";

const API_URL = "https://musicbrainz.org/ws/2/";
/** MusicBrainz allows one request per second for each application. A little more leaves room for clock jitter. */
export const REQUEST_INTERVAL = 1100;
/** A request that MusicBrainz answers with 429, 500, 502, 503 or 504, or that fails on the network, is sent again this many times. */
const RETRIES = 3;
/** First wait before a request is sent again, in milliseconds. It doubles with each retry. */
const RETRY_DELAY = 2000;

export class MusicBrainzRequestError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`MusicBrainz request failed (${status}): ${path}`);
  }
}

/**
 * Client for the MusicBrainz web service. All requests of the process go through one queue,
 * at most one per REQUEST_INTERVAL, because the rate limit counts the whole application.
 */
export class MusicBrainzClient {
  private queue: Promise<unknown> = Promise.resolve();
  private lastRequest = 0;

  constructor(
    private readonly userAgent: string,
    private readonly now: () => number = Date.now,
  ) {}

  /** GET of a path below /ws/2/ with JSON output. Repeated parameters (for example `resource`) take an array. */
  get<T>(path: string, params: Record<string, string | string[]> = {}): Promise<T> {
    const search = new URLSearchParams({ fmt: "json" });
    for (const [name, value] of Object.entries(params))
      for (const item of Array.isArray(value) ? value : [value]) search.append(name, item);
    const url = `${API_URL}${path}?${search}`;
    const result = this.queue.then(() => this.send<T>(url, path));
    // A failed request must not stop the queue.
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async send<T>(url: string, path: string): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const wait = this.lastRequest + REQUEST_INTERVAL - this.now();
      if (wait > 0) await delay(wait);
      this.lastRequest = this.now();
      let response: Response;
      try {
        response = await fetch(url, { headers: { "User-Agent": this.userAgent, Accept: "application/json" } });
      } catch (error) {
        if (attempt >= RETRIES) throw error;
        await delay(RETRY_DELAY * 2 ** attempt);
        continue;
      }
      if (response.ok) return (await response.json()) as T;
      // Not found is an answer: the caller reads it as "no match".
      if (response.status === 404) throw new MusicBrainzRequestError(404, path);
      if (attempt >= RETRIES || ![429, 500, 502, 503, 504].includes(response.status))
        throw new MusicBrainzRequestError(response.status, path);
      const retryAfter = Number(response.headers.get("retry-after")) * 1000;
      await delay(retryAfter > 0 ? retryAfter : RETRY_DELAY * 2 ** attempt);
    }
  }
}
