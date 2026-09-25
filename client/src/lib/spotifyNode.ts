import type { NodeInput } from "@/types/graph";

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
