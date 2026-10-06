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
