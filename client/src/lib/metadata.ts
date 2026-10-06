import type { NodeData } from "@/types/graph";

/** A MusicBrainz tag and the number of users who gave it. */
export interface MusicTag {
  name: string;
  count: number;
}

/** Metadata of a Spotify artist or album from MusicBrainz, as the API answers it. */
export interface MusicMetadata {
  sid: string;
  status: "FOUND" | "NOT_FOUND" | "PENDING";
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

export type MetadataKind = "artist" | "album";

/** The fields of the metadata queries. */
export const METADATA_FIELDS =
  "sid status mbid url rating ratingVotes genres { name count } tags { name count } type secondaryTypes country area beginYear endYear";

/**
 * The node attributes that metadata adds. Color, size and tooltip rules and the graph search
 * can use them. They are not fields of the GraphQL types, so the schema lists them apart.
 */
export const METADATA_ATTRIBUTES: Record<MetadataKind, string[]> = {
  artist: ["mbRating", "mbVotes", "mbType", "country", "beginYear", "endYear"],
  album: ["mbRating", "mbVotes", "mbType", "releaseYear"],
};

/**
 * Node attributes that come from MusicBrainz or from the metadata module. A saved or shared
 * graph leaves them out: the server keeps them, and the next load adds them again.
 */
export const METADATA_DATA_KEYS = [
  "mbStatus",
  "mbId",
  "mbUrl",
  "mbRating",
  "mbVotes",
  "mbGenres",
  "mbTags",
  "mbType",
  "mbSecondaryTypes",
  "country",
  "area",
  "beginYear",
  "endYear",
  "releaseYear",
  "imagesLoaded",
];

/** Node data without the attributes that metadata adds. */
export function withoutMetadata<T extends Record<string, unknown>>(data: T): T {
  const copy = { ...data };
  METADATA_DATA_KEYS.forEach((key) => delete copy[key]);
  return copy;
}

/** A node whose metadata has an answer. PENDING and nodes never asked are not settled. */
export const metadataSettled = (data: Partial<NodeData>) =>
  data.mbStatus === "FOUND" || data.mbStatus === "NOT_FOUND";

/** The node data of an answer. Albums keep their Spotify release year, which needs no MusicBrainz. */
export function toNodeData(metadata: MusicMetadata): Partial<NodeData> {
  return {
    mbStatus: metadata.status,
    // Not `mbid`: database artists have their own `mbid` attribute.
    mbId: metadata.mbid ?? undefined,
    mbUrl: metadata.url ?? undefined,
    mbRating: metadata.rating ?? undefined,
    mbVotes: metadata.ratingVotes ?? undefined,
    mbGenres: metadata.genres.map((genre) => genre.name),
    mbTags: metadata.tags,
    mbType: metadata.type ?? undefined,
    mbSecondaryTypes: metadata.secondaryTypes,
    country: metadata.country ?? undefined,
    area: metadata.area ?? undefined,
    beginYear: metadata.beginYear ?? undefined,
    endYear: metadata.endYear ?? undefined,
  };
}

/** The year of a Spotify `release_date` ("1998", "1998-04" or "1998-04-20"), or undefined. */
export function releaseYear(releaseDate: unknown): number | undefined {
  const year = Number.parseInt(String(releaseDate ?? "").slice(0, 4), 10);
  return Number.isFinite(year) ? year : undefined;
}

/** The tags of a node as MusicBrainz gave them, the most voted first. */
export const tagsOf = (data: Partial<NodeData>): MusicTag[] =>
  Array.isArray(data.mbTags) ? (data.mbTags as MusicTag[]) : [];
