import type { NodeInput } from "@/types/graph";
import type { Song, SpotifyImage, SpotifyTrack } from "@/types/spotify";

/**
 * Builds a graph node from a Spotify object. The node id is `<label>/<spotify id>`
 * and the Spotify id stays in `data.sid`.
 */
export function nodeFromSpotify(
  label: string,
  { id, ...data }: Record<string, unknown>,
): NodeInput {
  return {
    id: `${label}/${String(id)}`,
    data: { sid: String(id), ...data, label },
  };
}

/** Song, artist and album nodes give songs: their own, or a random one of the artist or album. */
export const hasSongs = (node: { data: { label?: unknown } }) =>
  ["song", "artist", "album"].includes(String(node.data.label));

/** The images of a node as Spotify images. Database artists store plain URLs, Spotify objects store `{ url }`. */
export const spotifyImages = (images: unknown): SpotifyImage[] =>
  Array.isArray(images)
    ? images
        .filter(Boolean)
        .map((image) =>
          typeof image === "string" ? { url: image } : (image as SpotifyImage),
        )
    : [];

/** A song with the cover of its album, or the given images when it has no album. */
export const songFromTrack = (
  track: SpotifyTrack,
  images: SpotifyImage[] = [],
): Song => ({ ...track, images: track.album?.images ?? images });

/** Width from which an image is sharp enough for a cover on a node, in pixels. */
const COVER_WIDTH = 160;

/**
 * The URL of the image that a node shows: the smallest image that is at least COVER_WIDTH
 * wide. Without widths (database artists), the first image, which Spotify lists largest first.
 */
export function coverUrl(images: unknown): string | null {
  const list = spotifyImages(images);
  if (list.length === 0) return null;
  const sized = list.filter((image) => image.width);
  if (sized.length === 0) return list[0].url;
  const sharp = sized
    .filter((image) => (image.width ?? 0) >= COVER_WIDTH)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (
    sharp[0] ?? [...sized].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
  ).url;
}
