import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { metadataOfLine } from "./import-musicbrainz-artists.js";

const snowPatrol = readFileSync(new URL("../src/datasources/musicbrainz/fixtures/artist-snow-patrol.json", import.meta.url), "utf-8");

test("keeps an artist with a Spotify link, under its Spotify id", () => {
  const line = JSON.stringify(JSON.parse(snowPatrol));
  const [metadata] = metadataOfLine(line);
  expect(metadata).toMatchObject({ sid: "3rIZMv9rysU7JkLzEaC5Jp", status: "FOUND", rating: 3.8, beginYear: 1994 });
});

test("skips an artist without a Spotify link without parsing it", () => {
  expect(metadataOfLine('{"id":"x","relations":[]}')).toEqual([]);
  expect(metadataOfLine("not json, and never parsed")).toEqual([]);
});
