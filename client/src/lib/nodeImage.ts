import type { NodeImageShape } from "@/lib/view/contract";
import { coverUrl } from "@/lib/spotifyNode";
import type { GraphNode } from "@/types/graph";
import type { NgraphGraph } from "ngraph.graph";

/** Artists show their photo in a circle, so they read apart from album covers. */
export const imageShapeOf = (node: GraphNode): NodeImageShape =>
  node.data.label === "artist" ? "circle" : "square";

/** The album node that a song links to, if it is in the graph. */
function linkedAlbum(graph: NgraphGraph, node: GraphNode) {
  let album: GraphNode | undefined;
  graph.forEachLinkedNode(node.id, (linked) => {
    if (linked.data.label === "album") {
      album = linked;
      return true;
    }
  });
  return album;
}

/**
 * The image URL of a node, or null. Artists and albums show their own image. A song shows
 * the cover of its album only while the album node is not in the graph: next to it the
 * same picture would show twice.
 */
export function nodeImageUrl(
  graph: NgraphGraph,
  node: GraphNode,
): string | null {
  const label = node.data.label;
  if (label === "artist" || label === "album")
    return coverUrl(node.data.images);
  if (label !== "song" || linkedAlbum(graph, node)) return null;
  return coverUrl(
    (node.data.album as { images?: unknown } | undefined)?.images,
  );
}
