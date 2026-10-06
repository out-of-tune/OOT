import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { delay } from "../../helpers/delay.js";
import { MusicBrainzClient, MusicBrainzRequestError, REQUEST_INTERVAL } from "./client.js";

vi.mock("../../helpers/delay.js", () => ({ delay: vi.fn(async () => {}) }));

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

let fetchMock: ReturnType<typeof vi.fn>;
let clock: number;
const now = () => clock;

beforeEach(() => {
  clock = 10_000;
  fetchMock = vi.fn(async () => json({ ok: true }));
  vi.stubGlobal("fetch", fetchMock);
  // Each wait moves the fake clock on, as a real wait would.
  vi.mocked(delay).mockImplementation(async (ms: number) => {
    clock += ms;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(delay).mockReset();
});

test("sends JSON requests with the User-Agent and repeated parameters", async () => {
  const client = new MusicBrainzClient("oot/1 ( a@b.c )", now);
  await client.get("url", { resource: ["r1", "r2"], inc: "artist-rels" });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("https://musicbrainz.org/ws/2/url?fmt=json&resource=r1&resource=r2&inc=artist-rels");
  expect(init.headers["User-Agent"]).toBe("oot/1 ( a@b.c )");
});

test("keeps REQUEST_INTERVAL between requests, also when they start together", async () => {
  const client = new MusicBrainzClient("ua", now);
  const sent: number[] = [];
  fetchMock.mockImplementation(async () => {
    sent.push(clock);
    return json({});
  });
  await Promise.all([client.get("a"), client.get("b"), client.get("c")]);
  expect(sent[1] - sent[0]).toBeGreaterThanOrEqual(REQUEST_INTERVAL);
  expect(sent[2] - sent[1]).toBeGreaterThanOrEqual(REQUEST_INTERVAL);
});

test("retries a 503 after its Retry-After and keeps the queue going after a failure", async () => {
  const client = new MusicBrainzClient("ua", now);
  fetchMock
    .mockResolvedValueOnce(json({}, 503, { "retry-after": "4" }))
    .mockResolvedValueOnce(json({ id: 1 }))
    .mockResolvedValueOnce(json({}, 400))
    .mockResolvedValueOnce(json({ id: 2 }));
  await expect(client.get("a")).resolves.toEqual({ id: 1 });
  expect(vi.mocked(delay)).toHaveBeenCalledWith(4000);
  await expect(client.get("b")).rejects.toBeInstanceOf(MusicBrainzRequestError);
  await expect(client.get("c")).resolves.toEqual({ id: 2 });
});

test("reports 404 at once", async () => {
  fetchMock.mockResolvedValue(json({}, 404));
  await expect(new MusicBrainzClient("ua", now).get("artist/x")).rejects.toMatchObject({ status: 404 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("fails at once on 400, which MusicBrainz sends for an include it does not allow", async () => {
  fetchMock.mockResolvedValue(json({ error: "genres is not a valid inc parameter for the url resource" }, 400));
  await expect(new MusicBrainzClient("ua", now).get("url", { inc: "genres" })).rejects.toMatchObject({ status: 400 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
