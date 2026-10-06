import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { artistMetadata, releaseGroupMetadata, spotifyArtistIds, spotifyIdOf, yearOf } from "./parse.js";

/** A line of the artist JSON dump (2026-10-03), cut to the fields the parser reads. */
const snowPatrol = JSON.parse(readFileSync(new URL("./fixtures/artist-snow-patrol.json", import.meta.url), "utf-8"));

describe("artistMetadata", () => {
  test("reads a dump line", () => {
    const metadata = artistMetadata("3rIZMv9rysU7JkLzEaC5Jp", snowPatrol);
    expect(metadata).toMatchObject({
      sid: "3rIZMv9rysU7JkLzEaC5Jp",
      status: "FOUND",
      mbid: snowPatrol.id,
      url: `https://musicbrainz.org/artist/${snowPatrol.id}`,
      rating: 3.8,
      ratingVotes: 5,
      type: "Group",
      area: "United Kingdom",
      beginYear: 1994,
      endYear: null,
    });
    expect(metadata.tags[0]).toEqual({ name: "alternative rock", count: 5 });
    expect(metadata.tags.map((tag) => tag.count)).toEqual([...metadata.tags.map((tag) => tag.count)].sort((a, b) => b - a));
  });

  test("leaves out tags without votes and a rating without votes", () => {
    const metadata = artistMetadata("x", {
      id: "m",
      tags: [
        { name: "b", count: 2 },
        { name: "zero", count: 0 },
        { name: "a", count: 2 },
      ],
      rating: { value: null, "votes-count": 0 },
    });
    expect(metadata.tags).toEqual([
      { name: "a", count: 2 },
      { name: "b", count: 2 },
    ]);
    expect(metadata.rating).toBeNull();
    expect(metadata.ratingVotes).toBeNull();
  });
});

test("releaseGroupMetadata reads type, secondary types and the first release year", () => {
  const metadata = releaseGroupMetadata("s", {
    id: "rg",
    "primary-type": "Album",
    "secondary-types": ["Live"],
    "first-release-date": "1998-04-20",
    rating: { value: 4.4, "votes-count": 30 },
    genres: [{ name: "idm", count: 7 }],
  });
  expect(metadata).toMatchObject({
    url: "https://musicbrainz.org/release-group/rg",
    type: "Album",
    secondaryTypes: ["Live"],
    beginYear: 1998,
    rating: 4.4,
    ratingVotes: 30,
    genres: [{ name: "idm", count: 7 }],
  });
});

test("yearOf reads partial dates", () => {
  expect([yearOf("1998"), yearOf("1998-04"), yearOf(""), yearOf(null)]).toEqual([1998, 1998, null, null]);
});

test("spotifyIdOf reads only the asked kind", () => {
  const url = "https://open.spotify.com/artist/3rIZMv9rysU7JkLzEaC5Jp?si=x";
  expect(spotifyIdOf(url, "artist")).toBe("3rIZMv9rysU7JkLzEaC5Jp");
  expect(spotifyIdOf(url, "album")).toBeNull();
  expect(spotifyIdOf("https://www.discogs.com/artist/21757", "artist")).toBeNull();
});

test("spotifyArtistIds reads the URL relations of a dump line", () => {
  expect(spotifyArtistIds(snowPatrol)).toEqual(["3rIZMv9rysU7JkLzEaC5Jp"]);
});
