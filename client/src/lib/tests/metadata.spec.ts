import {
  toNodeData,
  metadataSettled,
  releaseYear,
  withoutMetadata,
  type MusicMetadata,
} from "../metadata";

const found: MusicMetadata = {
  sid: "s",
  status: "FOUND",
  mbid: "m",
  url: "https://musicbrainz.org/artist/m",
  rating: 4.5,
  ratingVotes: 10,
  genres: [{ name: "idm", count: 3 }],
  tags: [{ name: "idm", count: 3 }],
  type: "Group",
  secondaryTypes: [],
  country: "GB",
  area: "United Kingdom",
  beginYear: 1986,
  endYear: null,
};

it("toNodeData keeps the database mbid apart and leaves missing values out", () => {
  const data = toNodeData(found);
  expect(data).toMatchObject({
    mbStatus: "FOUND",
    mbId: "m",
    mbRating: 4.5,
    mbVotes: 10,
    mbGenres: ["idm"],
    beginYear: 1986,
  });
  expect(data).not.toHaveProperty("mbid");
  expect(data.endYear).toBeUndefined();
});

it("metadataSettled is true only for an answer", () => {
  expect(metadataSettled({ mbStatus: "FOUND" })).toBe(true);
  expect(metadataSettled({ mbStatus: "NOT_FOUND" })).toBe(true);
  expect(metadataSettled({ mbStatus: "PENDING" })).toBe(false);
  expect(metadataSettled({})).toBe(false);
});

it("releaseYear reads Spotify dates", () => {
  expect(releaseYear("1998-04-20")).toBe(1998);
  expect(releaseYear("1998")).toBe(1998);
  expect(releaseYear(undefined)).toBeUndefined();
});

it("withoutMetadata keeps the Spotify and database data", () => {
  const data = {
    label: "artist",
    name: "A",
    mbid: "db",
    images: [],
    ...toNodeData(found),
    imagesLoaded: true,
  };
  expect(withoutMetadata(data)).toEqual({
    label: "artist",
    name: "A",
    mbid: "db",
    images: [],
  });
});
