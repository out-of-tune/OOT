import { aql, type Database } from "arangojs";
import { chunk } from "../../helpers/chunk.js";
import BaseAPI from "../arangodb/base.js";
import { MusicBrainzClient, MusicBrainzRequestError } from "./client.js";
import {
  artistMetadata,
  empty,
  releaseGroupMetadata,
  spotifyIdOf,
  type MbEntity,
  type MusicMetadata,
} from "./parse.js";

export type MetadataKind = "artist" | "album";

/** A "not found" answer is asked again after this time, so that new MusicBrainz links show. */
const NOT_FOUND_TTL = 30 * 24 * 3600 * 1000;
/** Found metadata is read again after this time, so that new tags and ratings show. */
const FOUND_TTL = 90 * 24 * 3600 * 1000;
/** The URL lookup takes up to 100 URLs in one request, and a search answers up to 100 entities. */
const BATCH = 100;
/** Barcodes in one search. A barcode can match several pressings, and a search answers at most BATCH. */
const BARCODE_BATCH = 25;
/** After a failed barcode step, barcodes rest this long, so that a Spotify ban is not made longer. */
const BARCODE_PAUSE = 30 * 60 * 1000;
/** Ids in one query of the client. */
export const MAX_IDS = 200;

const COLLECTIONS: Record<MetadataKind, string> = {
  artist: "musicbrainz_artist",
  album: "musicbrainz_album",
};

interface StoredMetadata extends MusicMetadata {
  _key: string;
  fetchedAt: number;
}

interface UrlLookup {
  urls?: UrlEntry[];
}
interface UrlEntry {
  resource: string;
  relations?: { artist?: { id: string }; release?: { id: string } }[];
}

/** The answer of a URL lookup has `urls` for several resources and the entry itself for one. */
const urlEntries = (answer: UrlLookup & Partial<UrlEntry>): UrlEntry[] =>
  answer.urls ?? (answer.resource ? [answer as UrlEntry] : []);

/**
 * The forms of a barcode that MusicBrainz may store: Spotify gives UPC-A (12 digits) or
 * EAN-13, and a release stores what it prints, with or without the leading zero.
 */
export function barcodeForms(code: string): string[] {
  const bare = code.replace(/^0+/, "");
  return [...new Set([code, bare, bare.padStart(12, "0"), bare.padStart(13, "0")])];
}

/** The Spotify URL of an id, as MusicBrainz stores it. */
const spotifyUrl = (kind: MetadataKind, sid: string) => `https://open.spotify.com/${kind}/${sid}`;

/** Stores metadata by Spotify id, replacing older answers. The dump import uses it too. */
export async function storeMetadata(
  db: Database,
  kind: MetadataKind,
  metadata: MusicMetadata[],
  fetchedAt: number,
) {
  if (metadata.length === 0) return;
  await db
    .collection(COLLECTIONS[kind])
    .saveAll(
      metadata.map((item) => ({ ...item, _key: item.sid, fetchedAt })),
      { overwriteMode: "replace" },
    );
}

/** Looks up the barcodes (UPC) of Spotify albums. The API reads them with its app token. */
export type BarcodeSource = (albumIds: string[]) => Promise<Map<string, string>>;

/**
 * Metadata of Spotify artists and albums from MusicBrainz. Stored answers come back at once.
 * Ids without one come back as PENDING and go into a queue, which one worker reads at the
 * rate that MusicBrainz allows. The client asks again for pending ids.
 */
class MusicBrainzAPI {
  private readonly queued: Record<MetadataKind, Set<string>> = { artist: new Set(), album: new Set() };
  /** Ids that a user looks at now. They go before the rest of the queue. */
  private readonly urgent: Record<MetadataKind, Set<string>> = { artist: new Set(), album: new Set() };
  /** Ids of the batch that runs. A query that comes meanwhile does not queue them again. */
  private readonly inFlight: Record<MetadataKind, Set<string>> = { artist: new Set(), album: new Set() };
  private working = false;
  /** Time until which albums without a link wait instead of using barcodes. */
  private barcodesPausedUntil = 0;
  private stopped = false;

  constructor(
    private readonly db: Database,
    private readonly client: MusicBrainzClient,
    private readonly barcodes: BarcodeSource,
    private readonly now: () => number = Date.now,
  ) {}

  static async onConnect(db: Database) {
    await Promise.all(Object.values(COLLECTIONS).map((name) => BaseAPI.ensureCollection(db, name)));
  }

  stop() {
    this.stopped = true;
  }

  /** Metadata for each id, in the order of the ids. Urgent ids go before the rest of the queue. */
  async metadata(kind: MetadataKind, sids: readonly string[], urgent = false): Promise<MusicMetadata[]> {
    const ids = [...new Set(sids)].slice(0, MAX_IDS);
    const stored = await this.read(kind, ids);
    const answers = new Map<string, MusicMetadata>();
    for (const sid of ids) {
      const document = stored.get(sid);
      if (document) {
        const { _key, fetchedAt, ...metadata } = document;
        answers.set(sid, metadata);
        if (this.isStale(document)) this.enqueue(kind, sid, false);
      } else {
        answers.set(sid, empty(sid, "PENDING"));
        this.enqueue(kind, sid, urgent);
      }
    }
    // The worker starts after all ids are queued, so that they go in one batch.
    if (!this.working) void this.work();
    return sids.map((sid) => answers.get(sid) ?? empty(sid, "PENDING"));
  }

  private isStale(document: StoredMetadata) {
    const age = this.now() - document.fetchedAt;
    return age > (document.status === "FOUND" ? FOUND_TTL : NOT_FOUND_TTL);
  }

  private async read(kind: MetadataKind, sids: string[]) {
    const collection = this.db.collection(COLLECTIONS[kind]);
    const cursor = await this.db.query(aql`
      FOR key IN ${sids}
        LET document = DOCUMENT(${collection}, key)
        FILTER document != null
        RETURN document`);
    const documents = (await cursor.all()) as StoredMetadata[];
    return new Map(documents.map((doc) => [doc._key, doc]));
  }

  /** Stores answers. The next query reads them. */
  store(kind: MetadataKind, metadata: MusicMetadata[]) {
    return storeMetadata(this.db, kind, metadata, this.now());
  }

  private enqueue(kind: MetadataKind, sid: string, urgent: boolean) {
    if (this.inFlight[kind].has(sid)) return;
    (urgent ? this.urgent : this.queued)[kind].add(sid);
  }

  /** The next batch: urgent ids first, then artists (cheaper and more often shown), then albums. */
  private next(): { kind: MetadataKind; batch: string[] } | undefined {
    for (const queue of [this.urgent, this.queued])
      for (const kind of ["artist", "album"] as const)
        if (queue[kind].size > 0) {
          const batch = [...queue[kind]].slice(0, BATCH);
          batch.forEach((sid) => queue[kind].delete(sid));
          return { kind, batch };
        }
    return undefined;
  }

  /**
   * Reads the queues until they are empty. The ids of a batch leave the queue before it
   * runs, so a failed batch is not repeated at once: the next query of the client asks again.
   */
  private async work() {
    this.working = true;
    try {
      for (let next = this.next(); next && !this.stopped; next = this.next()) {
        const { kind, batch } = next;
        batch.forEach((sid) => this.inFlight[kind].add(sid));
        try {
          await (kind === "artist" ? this.fetchArtists(batch) : this.fetchAlbums(batch));
        } catch (error) {
          console.error(`MusicBrainz ${kind} batch failed: ${(error as Error).message}`);
        } finally {
          batch.forEach((sid) => this.inFlight[kind].delete(sid));
        }
      }
    } finally {
      this.working = false;
    }
  }

  /** The MusicBrainz ids of Spotify URLs, from one URL lookup. */
  private async lookUpUrls(kind: MetadataKind, sids: string[], entity: "artist" | "release") {
    const answer = await this.client
      .get<UrlLookup & Partial<UrlEntry>>("url", {
        resource: sids.map((sid) => spotifyUrl(kind, sid)),
        inc: `${entity}-rels`,
      })
      .catch((error) => {
        // A lookup of one unknown URL answers 404.
        if (error instanceof MusicBrainzRequestError && error.status === 404) return {};
        throw error;
      });
    const found = new Map<string, string>();
    for (const entry of urlEntries(answer)) {
      const sid = spotifyIdOf(entry.resource, kind);
      const target = entry.relations?.find((relation) => relation[entity])?.[entity];
      if (sid && target && !found.has(sid)) found.set(sid, target.id);
    }
    return found;
  }

  /**
   * Tags and ratings cannot come with the URL lookup (MusicBrainz answers 400 for those
   * includes on URLs), so each artist takes one lookup. A lookup that fails leaves the
   * artist out, and a later query tries again.
   */
  async fetchArtists(sids: string[]) {
    const mbids = await this.lookUpUrls("artist", sids, "artist");
    const artists = new Map<string, MbEntity>();
    for (const [sid, mbid] of mbids) {
      if (this.stopped) break;
      try {
        artists.set(sid, await this.client.get<MbEntity>(`artist/${mbid}`, { inc: "genres+tags+ratings" }));
      } catch (error) {
        console.error(`MusicBrainz artist ${mbid}: ${(error as Error).message}`);
      }
    }
    await this.store(
      "artist",
      sids
        .filter((sid) => artists.has(sid) || !mbids.has(sid))
        .map((sid) => {
          const artist = artists.get(sid);
          return artist ? artistMetadata(sid, artist) : empty(sid, "NOT_FOUND");
        }),
    );
  }

  /**
   * Albums: the Spotify album URL leads to a release; without one, the barcode (UPC) does.
   * The metadata is the one of the release group, the album above all its pressings.
   */
  async fetchAlbums(sids: string[]) {
    const releases = await this.lookUpUrls("album", sids, "release");
    const missing = sids.filter((sid) => !releases.has(sid));
    // Albums whose barcode step failed get no answer, so that a later query tries them again.
    let unknown = new Set<string>();
    if (missing.length > 0 && this.now() < this.barcodesPausedUntil) unknown = new Set(missing);
    else if (missing.length > 0) {
      try {
        for (const [sid, release] of await this.releasesByBarcode(missing)) releases.set(sid, release);
      } catch (error) {
        console.error(`MusicBrainz barcodes: ${(error as Error).message}. Barcodes rest for a while.`);
        this.barcodesPausedUntil = this.now() + BARCODE_PAUSE;
        unknown = new Set(missing);
      }
    }
    const groups = new Map<string, MbEntity>();
    for (const [sid, release] of releases) {
      if (this.stopped) break;
      try {
        // A browse by release returns its release group with tags and rating in one request.
        const answer = await this.client.get<{ "release-groups"?: MbEntity[] }>("release-group", {
          release,
          inc: "genres+tags+ratings",
        });
        const group = answer["release-groups"]?.[0];
        if (group) groups.set(sid, group);
      } catch (error) {
        console.error(`MusicBrainz release-group of ${release}: ${(error as Error).message}`);
      }
    }
    await this.store(
      "album",
      sids
        .filter((sid) => groups.has(sid) || (!releases.has(sid) && !unknown.has(sid)))
        .map((sid) => {
          const group = groups.get(sid);
          return group ? releaseGroupMetadata(sid, group) : empty(sid, "NOT_FOUND");
        }),
    );
  }

  /** Releases by the barcodes of the albums, from one search for each BARCODE_BATCH albums. Throws when a step fails. */
  private async releasesByBarcode(sids: string[]) {
    const codes = await this.barcodes(sids);
    const found = new Map<string, string>();
    const releaseOf = new Map<string, string>();
    for (const batch of chunk([...new Set(codes.values())], BARCODE_BATCH)) {
      if (this.stopped) break;
      const answer = await this.client.get<{ releases?: { id: string; barcode?: string | null }[] }>("release", {
        query: [...new Set(batch.flatMap(barcodeForms))]
          .map((code) => `barcode:${code}`)
          .join(" OR "),
        limit: String(BATCH),
      });
      for (const release of answer.releases ?? [])
        if (release.barcode && !releaseOf.has(release.barcode)) releaseOf.set(release.barcode, release.id);
    }
    for (const [sid, code] of codes) {
      const release = barcodeForms(code)
        .map((form) => releaseOf.get(form))
        .find(Boolean);
      if (release) found.set(sid, release);
    }
    return found;
  }

}

export default MusicBrainzAPI;
