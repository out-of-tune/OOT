// Loads MusicBrainz metadata of artists from the JSON dump into ArangoDB, so the API needs
// no live requests for them. Only artists with a Spotify link are kept.
//
// The dump is at https://data.metabrainz.org/pub/musicbrainz/data/json-dumps/ (artist.tar.xz,
// about 2 GB). It is one JSON object per line. Stream it in, without unpacking it to disk:
//
//   xz -dc artist.tar.xz | tar -xO mbdump/artist | npx tsx scripts/import-musicbrainz-artists.ts
//
// The API settings (.env) give the database. The API must have started once, so that the
// collection exists. Running it again replaces the same documents.
import { createInterface } from "node:readline";
import { Database } from "arangojs";
import { storeMetadata } from "../src/datasources/musicbrainz/index.js";
import { artistMetadata, spotifyArtistIds, type MbEntity, type MusicMetadata } from "../src/datasources/musicbrainz/parse.js";
import * as settings from "../src/helpers/settings.js";

/** Documents in one write. */
const BATCH = 1000;

/** The metadata of a dump line, one entry for each Spotify artist that the MusicBrainz artist links to. */
export function metadataOfLine(line: string): MusicMetadata[] {
  if (!line.includes("open.spotify.com/artist/")) return [];
  let artist: MbEntity;
  try {
    artist = JSON.parse(line) as MbEntity;
  } catch {
    // A cut stream ends in half a line.
    console.warn(`Skipped a line that is not JSON: ${line.slice(0, 60)}…`);
    return [];
  }
  return spotifyArtistIds(artist).map((sid) => artistMetadata(sid, artist));
}

async function main() {
  const db = new Database({
    url: `http://${settings.ARANGO_HOST}:${settings.ARANGO_PORT}`,
    databaseName: settings.ARANGO_DB,
    auth: { username: settings.ARANGO_USER, password: settings.getArangoPassword() },
  });
  const now = Date.now();
  let batch: MusicMetadata[] = [];
  let lines = 0;
  let stored = 0;
  for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    lines += 1;
    batch.push(...metadataOfLine(line));
    if (batch.length >= BATCH) {
      await storeMetadata(db, "artist", batch, now);
      stored += batch.length;
      batch = [];
      console.log(`${lines} artists read, ${stored} with a Spotify link stored`);
    }
  }
  await storeMetadata(db, "artist", batch, now);
  stored += batch.length;
  console.log(`Done: ${lines} artists read, ${stored} with a Spotify link stored.`);
}

// Runs only as a script, so the test can import metadataOfLine.
if (import.meta.url === `file://${process.argv[1]}`) await main();
