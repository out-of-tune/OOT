// Loads a small sample graph (genres, artists and their links) into ArangoDB for local UI tests.
// Running it again replaces the same documents, so it is safe to repeat.
//
// Environment: ARANGO_URL (default http://arangodb:8529), ARANGODB_DATABASE, ARANGODB_USER, ARANGODB_PASSWORD.
// The API must have started once, so that the database and the collections exist.

const url = process.env.ARANGO_URL ?? "http://arangodb:8529";
const database = process.env.ARANGODB_DATABASE ?? "OOT";
const auth = Buffer.from(
  `${process.env.ARANGODB_USER ?? "root"}:${process.env.ARANGODB_PASSWORD ?? ""}`,
).toString("base64");

// Genre key, name, and the key of its supergenre.
const genres = [
  ["rock", "rock", null],
  ["alternative-rock", "alternative rock", "rock"],
  ["indie-rock", "indie rock", "alternative-rock"],
  ["grunge", "grunge", "alternative-rock"],
  ["britpop", "britpop", "alternative-rock"],
  ["classic-rock", "classic rock", "rock"],
  ["psychedelic-rock", "psychedelic rock", "rock"],
  ["pop", "pop", null],
  ["dance-pop", "dance pop", "pop"],
  ["art-pop", "art pop", "pop"],
  ["electronic", "electronic", null],
  ["house", "house", "electronic"],
  ["french-house", "french house", "house"],
  ["idm", "idm", "electronic"],
  ["krautrock", "krautrock", "electronic"],
  ["trip-hop", "trip hop", "electronic"],
  ["hip-hop", "hip hop", null],
  ["conscious-hip-hop", "conscious hip hop", "hip-hop"],
  ["rap", "rap", "hip-hop"],
  ["rnb", "r&b", null],
  ["jazz", "jazz", null],
  ["bebop", "bebop", "jazz"],
  ["modal-jazz", "modal jazz", "jazz"],
  ["reggae", "reggae", null],
  ["roots-reggae", "roots reggae", "reggae"],
];

// Spotify artist id, name, popularity, genre keys.
const artists = [
  ["4Z8W4fKeB5YxbusRsdQVPb", "Radiohead", 82, ["alternative-rock", "art-pop"]],
  ["7Ln80lUS6He07XvHI8qqHH", "Arctic Monkeys", 86, ["indie-rock", "britpop"]],
  ["6olE6TJLqED3rqDCT0FyPh", "Nirvana", 81, ["grunge"]],
  ["4gzpq5DPGxSnKTe4SA8HAU", "Coldplay", 88, ["britpop", "pop"]],
  [
    "3WrFJ7ztbogyGnTHbHJFl2",
    "The Beatles",
    85,
    ["classic-rock", "psychedelic-rock"],
  ],
  ["1dfeR4HaWDbWqFHLkxsg1d", "Queen", 86, ["classic-rock"]],
  [
    "5INjqkS1o8h1imAzPqGZBb",
    "Tame Impala",
    80,
    ["psychedelic-rock", "indie-rock"],
  ],
  ["06HL4z0CvFAxyc27GXpf02", "Taylor Swift", 100, ["pop"]],
  ["6qqNVTkY8uBg9cP3Jd7DAH", "Billie Eilish", 90, ["art-pop", "pop"]],
  ["1Xyo4u8uXC1ZmMpatF05PJ", "The Weeknd", 94, ["rnb", "dance-pop"]],
  ["6vWDO969PvNqNYHIOW5v0m", "Beyoncé", 84, ["rnb", "dance-pop"]],
  ["4dpARuHxo51G3z768sgnrY", "Adele", 83, ["pop"]],
  ["7w29UYBi0qsHi5RTcJaHMH", "Björk", 62, ["art-pop", "idm"]],
  ["4tZwfgrHOc3mvqYlEYSvVN", "Daft Punk", 82, ["french-house", "electronic"]],
  ["6kBDZFXuLrZgHnvmPu9NsG", "Aphex Twin", 64, ["idm"]],
  ["0dmPX6ovclgOy8WWJaFEUU", "Kraftwerk", 58, ["krautrock", "electronic"]],
  ["6FXMGgJwohJLUSr5nVlf9X", "Massive Attack", 65, ["trip-hop"]],
  ["6liAMWkVf5LH7YR9yfFy1Y", "Portishead", 60, ["trip-hop"]],
  [
    "2YZyLoL8N0Wb9xBt1NhZWg",
    "Kendrick Lamar",
    91,
    ["conscious-hip-hop", "rap"],
  ],
  ["7dGJo4pcD2V6oG8kP0tJRR", "Eminem", 88, ["rap"]],
  ["3TVXtAsR1Inumwj472S9r4", "Drake", 95, ["rap", "rnb"]],
  ["0kbYTNQb4Pb1rPbbaF0pT4", "Miles Davis", 60, ["modal-jazz", "bebop"]],
  ["2hGh5VOeeqimQFxqXvfCUf", "John Coltrane", 58, ["modal-jazz"]],
  [
    "2QsynagSdAqZj3U9HgDzjD",
    "Bob Marley & The Wailers",
    78,
    ["roots-reggae", "reggae"],
  ],
];

async function insert(collection, documents) {
  const response = await fetch(
    `${url}/_db/${database}/_api/document/${collection}?overwriteMode=replace`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documents),
    },
  );
  if (!response.ok)
    throw new Error(
      `${collection}: ${response.status} ${await response.text()}`,
    );
  const results = await response.json();
  const failed = results.filter((result) => result.error);
  if (failed.length > 0)
    throw new Error(`${collection}: ${failed[0].errorMessage}`);
  console.log(`${collection}: ${documents.length} documents`);
}

await insert(
  "Genre",
  genres.map(([key, name]) => ({ _key: key, name })),
);
await insert(
  "subgenre_supergenre",
  genres
    .filter(([, , parent]) => parent)
    .map(([key, , parent]) => ({
      _key: `${parent}--${key}`,
      _from: `Genre/${parent}`,
      _to: `Genre/${key}`,
    })),
);
await insert(
  "Artist",
  artists.map(([sid]) => ({ _key: sid, sid, mbid: "" })),
);
await insert(
  "artist_source",
  artists.map(([sid, name, popularity]) => ({
    _key: sid,
    _from: `Artist/${sid}`,
    _to: "Source/0",
    name,
    popularity,
    images: [],
  })),
);
await insert(
  "artist_genre",
  artists.flatMap(([sid, , , genreKeys]) =>
    genreKeys.map((genre) => ({
      _key: `${sid}--${genre}`,
      _from: `Artist/${sid}`,
      _to: `Genre/${genre}`,
    })),
  ),
);
console.log("Sample data loaded.");
