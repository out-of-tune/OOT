// Turns MusicBrainz entities (web service answers and JSON dump lines, which share one
// format) into the metadata that the API serves.

export interface MusicTag {
  name: string;
  count: number;
}

export type MetadataStatus = "FOUND" | "NOT_FOUND" | "PENDING";

export interface MusicMetadata {
  /** Spotify id. */
  sid: string;
  status: MetadataStatus;
  mbid: string | null;
  url: string | null;
  rating: number | null;
  ratingVotes: number | null;
  genres: MusicTag[];
  tags: MusicTag[];
  type: string | null;
  secondaryTypes: string[];
  country: string | null;
  area: string | null;
  beginYear: number | null;
  endYear: number | null;
}

interface MbTag {
  name: string;
  count?: number;
}

interface MbRelation {
  "target-type"?: string;
  url?: { resource?: string };
}

/** The fields of an artist or a release group that the metadata reads. */
export interface MbEntity {
  id: string;
  type?: string | null;
  "primary-type"?: string | null;
  "secondary-types"?: string[];
  country?: string | null;
  area?: { name?: string } | null;
  "life-span"?: { begin?: string | null; end?: string | null };
  "first-release-date"?: string;
  rating?: { value?: number | null; "votes-count"?: number };
  genres?: MbTag[];
  tags?: MbTag[];
  relations?: MbRelation[];
}

/** Tags kept for an entity. Popular entities have hundreds; the rest have one vote each and add noise. */
export const MAX_TAGS = 15;

/** The MAX_TAGS tags with the most votes, the most voted first. Ties go by name; tags without votes go. */
function sortTags(tags: MbTag[] = []): MusicTag[] {
  return tags
    .map((tag) => ({ name: tag.name, count: tag.count ?? 0 }))
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, MAX_TAGS);
}

/** The year of a MusicBrainz date ("1998", "1998-04" or "1998-04-20"), or null. */
export function yearOf(date: string | null | undefined): number | null {
  const year = Number.parseInt(date?.slice(0, 4) ?? "", 10);
  return Number.isFinite(year) ? year : null;
}

export const empty = (sid: string, status: MetadataStatus): MusicMetadata => ({
  sid,
  status,
  mbid: null,
  url: null,
  rating: null,
  ratingVotes: null,
  genres: [],
  tags: [],
  type: null,
  secondaryTypes: [],
  country: null,
  area: null,
  beginYear: null,
  endYear: null,
});

const rating = (entity: MbEntity) => {
  const votes = entity.rating?.["votes-count"] ?? 0;
  const value = entity.rating?.value;
  return votes > 0 && typeof value === "number" ? { rating: value, ratingVotes: votes } : { rating: null, ratingVotes: null };
};

/** Metadata of a MusicBrainz artist. */
export function artistMetadata(sid: string, artist: MbEntity): MusicMetadata {
  return {
    ...empty(sid, "FOUND"),
    mbid: artist.id,
    url: `https://musicbrainz.org/artist/${artist.id}`,
    ...rating(artist),
    genres: sortTags(artist.genres),
    tags: sortTags(artist.tags),
    type: artist.type ?? null,
    country: artist.country ?? null,
    area: artist.area?.name ?? null,
    beginYear: yearOf(artist["life-span"]?.begin),
    endYear: yearOf(artist["life-span"]?.end),
  };
}

/** Metadata of a MusicBrainz release group: an album, an EP, a single... */
export function releaseGroupMetadata(sid: string, group: MbEntity): MusicMetadata {
  return {
    ...empty(sid, "FOUND"),
    mbid: group.id,
    url: `https://musicbrainz.org/release-group/${group.id}`,
    ...rating(group),
    genres: sortTags(group.genres),
    tags: sortTags(group.tags),
    type: group["primary-type"] ?? null,
    secondaryTypes: group["secondary-types"] ?? [],
    beginYear: yearOf(group["first-release-date"]),
  };
}

const SPOTIFY_URL = /^https?:\/\/open\.spotify\.com\/(artist|album|track)\/([A-Za-z0-9]{22})/;

/** The Spotify id of a Spotify URL of the given kind, or null. */
export function spotifyIdOf(url: string | undefined, kind: "artist" | "album" | "track"): string | null {
  const match = url ? SPOTIFY_URL.exec(url) : null;
  return match && match[1] === kind ? match[2] : null;
}

/** The Spotify artist ids that an entity links to. A dump line carries its URL relations. */
export function spotifyArtistIds(entity: MbEntity): string[] {
  return (entity.relations ?? [])
    .filter((relation) => relation["target-type"] === "url")
    .map((relation) => spotifyIdOf(relation.url?.resource, "artist"))
    .filter((id): id is string => id !== null);
}
