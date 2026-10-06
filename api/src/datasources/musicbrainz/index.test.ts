import { describe, expect, test, vi } from "vitest";
import type { Database } from "arangojs";
import type { MusicBrainzClient } from "./client.js";
import { MusicBrainzRequestError } from "./client.js";
import MusicBrainzAPI, { barcodeForms } from "./index.js";

/** An in-memory stand-in for the two collections and the one AQL query that the source runs. */
function fakeDb() {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  const collection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    const documents = collections.get(name)!;
    return {
      // aql binds an object with this marker as a collection name.
      isArangoCollection: true,
      name,
      saveAll: async (items: Record<string, unknown>[]) => items.forEach((item) => documents.set(String(item._key), item)),
    };
  };
  const db = {
    collection,
    query: async (query: { bindVars: Record<string, unknown> }) => {
      const values = Object.values(query.bindVars);
      const keys = values.find(Array.isArray) as string[];
      const name = values.find((value) => typeof value === "string") as string;
      const documents = collections.get(name) ?? new Map();
      return { all: async () => keys.map((key) => documents.get(key)).filter(Boolean) };
    },
  };
  return { db: db as unknown as Database, collections };
}

/** A client that answers each path from a table, and records the calls. */
function fakeClient(answers: Record<string, unknown>) {
  const get = vi.fn(async (path: string, params: Record<string, string | string[]> = {}) => {
    const key = params.query
      ? `${path}?${params.query}`
      : typeof params.release === "string"
        ? `${path}?release=${params.release}`
        : path;
    if (!(key in answers)) throw new MusicBrainzRequestError(404, key);
    return answers[key];
  });
  return { client: { get } as unknown as MusicBrainzClient, get };
}

const ARTIST = "0dmPX6ovclgOy8WWJaFEUU";
const OTHER = "4tZwfgrHOc3mvqYlEYSvVi";
const url = (kind: string, sid: string) => `https://open.spotify.com/${kind}/${sid}`;

describe("metadata", () => {
  test("answers PENDING for unknown ids, then the stored metadata", async () => {
    const { db } = fakeDb();
    const { client } = fakeClient({
      url: { urls: [{ resource: url("artist", ARTIST), relations: [{ artist: { id: "mb1" } }] }] },
      "artist/mb1": { id: "mb1", type: "Group", rating: { value: 4.7, "votes-count": 18 }, genres: [{ name: "krautrock", count: 11 }] },
    });
    const source = new MusicBrainzAPI(db, client, async () => new Map());
    const [first] = await source.metadata("artist", [ARTIST]);
    expect(first.status).toBe("PENDING");
    await vi.waitFor(async () => expect((await source.metadata("artist", [ARTIST]))[0].status).toBe("FOUND"));
    const [found] = await source.metadata("artist", [ARTIST]);
    expect(found).toMatchObject({ sid: ARTIST, mbid: "mb1", rating: 4.7, ratingVotes: 18, type: "Group" });
    expect(found).not.toHaveProperty("_key");
  });

  test("stores NOT_FOUND for an artist without a MusicBrainz link, and keeps the order of the ids", async () => {
    const { db } = fakeDb();
    const { client } = fakeClient({
      url: { urls: [{ resource: url("artist", ARTIST), relations: [{ artist: { id: "mb1" } }] }] },
      "artist/mb1": { id: "mb1" },
    });
    const source = new MusicBrainzAPI(db, client, async () => new Map());
    await source.fetchArtists([OTHER, ARTIST]);
    const answers = await source.metadata("artist", [OTHER, ARTIST]);
    expect(answers.map((answer) => [answer.sid, answer.status])).toEqual([
      [OTHER, "NOT_FOUND"],
      [ARTIST, "FOUND"],
    ]);
  });

  test("leaves an artist out when its lookup fails, so that a later query tries again", async () => {
    const { db, collections } = fakeDb();
    const { client } = fakeClient({
      url: { urls: [{ resource: url("artist", ARTIST), relations: [{ artist: { id: "gone" } }] }] },
    });
    await new MusicBrainzAPI(db, client, async () => new Map()).fetchArtists([ARTIST]);
    expect(collections.get("musicbrainz_artist")?.size ?? 0).toBe(0);
  });

  test("asks again for a NOT_FOUND answer after 30 days", async () => {
    const { db } = fakeDb();
    const { client, get } = fakeClient({ url: { urls: [] } });
    let clock = 0;
    const source = new MusicBrainzAPI(db, client, async () => new Map(), () => clock);
    await source.fetchArtists([ARTIST]);
    get.mockClear();
    clock = 29 * 24 * 3600 * 1000;
    await source.metadata("artist", [ARTIST]);
    expect(get).not.toHaveBeenCalled();
    clock = 31 * 24 * 3600 * 1000;
    expect((await source.metadata("artist", [ARTIST]))[0].status).toBe("NOT_FOUND");
    await vi.waitFor(() => expect(get).toHaveBeenCalled());
  });
});

describe("albums", () => {
  test("finds the release group by the Spotify URL, and by the barcode without one", async () => {
    const { db } = fakeDb();
    const { client, get } = fakeClient({
      url: { urls: [{ resource: url("album", "A".repeat(22)), relations: [{ release: { id: "r1" } }] }] },
      "release?barcode:0801061005535 OR barcode:801061005535": { releases: [{ id: "r2", barcode: "801061005535" }] },
      "release-group?release=r1": {
        "release-groups": [{ id: "g1", "primary-type": "Album", "first-release-date": "1998-04-20" }],
      },
      "release-group?release=r2": { "release-groups": [{ id: "g2", "primary-type": "EP" }] },
    });
    const barcodes = vi.fn(async () => new Map([["B".repeat(22), "0801061005535"]]));
    const source = new MusicBrainzAPI(db, client, barcodes);
    await source.fetchAlbums(["A".repeat(22), "B".repeat(22), "C".repeat(22)]);
    expect(barcodes).toHaveBeenCalledWith(["B".repeat(22), "C".repeat(22)]);
    const answers = await source.metadata("album", ["A".repeat(22), "B".repeat(22), "C".repeat(22)]);
    expect(answers.map((answer) => [answer.status, answer.type, answer.beginYear])).toEqual([
      ["FOUND", "Album", 1998],
      ["FOUND", "EP", null],
      ["NOT_FOUND", null, null],
    ]);
    expect(get).toHaveBeenCalledWith("release-group", { release: "r1", inc: "genres+tags+ratings" });
  });
});

test("looks up urgent ids before the rest of the queue", async () => {
  const { db } = fakeDb();
  const order: string[] = [];
  const { client, get } = fakeClient({ url: { urls: [] } });
  get.mockImplementation(async (_path: string, params: Record<string, string | string[]> = {}) => {
    order.push(...(params.resource as string[]).map((resource) => resource.split("/").pop() as string));
    // The first batch is still running while the other queries come in.
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { urls: [] };
  });
  const source = new MusicBrainzAPI(db, client, async () => new Map());
  await source.metadata("artist", ["first"]);
  await source.metadata("artist", ["slow"]);
  await source.metadata("album", ["urgent"], true);
  await vi.waitFor(() => expect(order).toHaveLength(3));
  expect(order).toEqual(["first", "urgent", "slow"]);
});

test("a query looks up all its new ids in one batch, and a query meanwhile does not queue them again", async () => {
  const { db } = fakeDb();
  const urlCalls: string[][] = [];
  const { client, get } = fakeClient({});
  get.mockImplementation(async (path: string, params: Record<string, string | string[]> = {}) => {
    if (path === "url") {
      urlCalls.push((params.resource as string[]).map((resource) => resource.split("/").pop() as string));
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { urls: [] };
    }
    throw new MusicBrainzRequestError(404, path);
  });
  const source = new MusicBrainzAPI(db, client, async () => new Map());
  await source.metadata("artist", ["a", "b"]);
  // The client asks again while the batch runs.
  await source.metadata("artist", ["a", "b"]);
  await vi.waitFor(async () =>
    expect((await source.metadata("artist", ["a", "b"])).map((answer) => answer.status)).toEqual([
      "NOT_FOUND",
      "NOT_FOUND",
    ]),
  );
  expect(urlCalls).toEqual([["a", "b"]]);
});

test("stores no answer for albums whose barcode step failed, and rests the barcodes", async () => {
  const { db, collections } = fakeDb();
  const { client } = fakeClient({ url: { urls: [] } });
  const barcodes = vi.fn(async () => {
    throw new Error("Spotify 429");
  });
  let clock = 0;
  const source = new MusicBrainzAPI(db, client, barcodes, () => clock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  await source.fetchAlbums(["A".repeat(22)]);
  expect(collections.get("musicbrainz_album")?.size ?? 0).toBe(0);
  clock = 10 * 60 * 1000;
  await source.fetchAlbums(["A".repeat(22)]);
  expect(barcodes).toHaveBeenCalledTimes(1);
  clock = 31 * 60 * 1000;
  await source.fetchAlbums(["A".repeat(22)]);
  expect(barcodes).toHaveBeenCalledTimes(2);
});

test("barcodeForms covers UPC-A, EAN-13 and the code without leading zeros", () => {
  expect(barcodeForms("801061005535").sort()).toEqual(["0801061005535", "801061005535"]);
  expect(barcodeForms("0801061005535").sort()).toEqual(["0801061005535", "801061005535"]);
  expect(barcodeForms("00602547")).toContain("602547");
});
