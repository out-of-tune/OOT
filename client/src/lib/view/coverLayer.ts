import type { NodeId } from "@/types/graph";
import { rgbaParts } from "@/lib/color";
import { COVER_SIDE, type NodeImageShape } from "./contract";
import { refCounted } from "./refCounted";

/** Side of a cover relative to the side of the node square. The pointer still finds the node inside it. */
const COVER_SCALE = COVER_SIDE["2d"];
/** Covers smaller than this on screen are not drawn, in pixels. */
export const MIN_COVER_SIDE = 6;
/** Corner radius of square covers, relative to their side. */
const CORNER = 0.12;
/** Width of the ring in the node color around a cover, in pixels. It keeps color rules visible. */
const RING = 2;

/** What the layer needs to know about a node on each frame. */
export interface CoverNode {
  /** Screen position of the center, in pixels of the container. */
  x: number;
  y: number;
  /** Side of the node square on screen, in pixels. */
  side: number;
  /** RGBA color of the node. Its alpha is the alpha of the cover. */
  color: number;
}

interface Cover {
  url: string;
  shape: NodeImageShape;
  image: HTMLImageElement;
}

/**
 * A 2D canvas on top of the WebGL canvas of the 2D view that draws node images. The
 * WebGL square of a node stays below, so a node whose image is missing or still loading
 * shows as before. The canvas lets the pointer through.
 */
export function createCoverLayer(
  container: HTMLElement,
  /** Called when an image has loaded, so the view draws a new frame. */
  onImageLoad: () => void,
) {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
  });
  const context = canvas.getContext("2d");
  const covers = new Map<NodeId, Cover>();
  /** One image element for each URL, shared by the nodes that show it. */
  const images = refCounted(
    (url) => {
      const image = new Image();
      image.decoding = "async";
      image.addEventListener("load", onImageLoad);
      image.src = url;
      return image;
    },
    (image) => {
      image.removeEventListener("load", onImageLoad);
      image.src = "";
    },
  );

  /** Puts the canvas after the WebGL canvas, so the DOM labels that come later stay on top. */
  function attach() {
    if (canvas.isConnected) return;
    const webgl = container.querySelector("canvas");
    if (webgl) webgl.after(canvas);
    else container.prepend(canvas);
  }

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (canvas.width !== Math.round(width * ratio))
      canvas.width = Math.round(width * ratio);
    if (canvas.height !== Math.round(height * ratio))
      canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawCover(
    cover: Cover,
    node: CoverNode,
    width: number,
    height: number,
  ) {
    if (!context) return;
    const { r, g, b, a: alpha } = rgbaParts(node.color);
    const side = node.side * COVER_SCALE;
    const left = node.x - side / 2;
    const top = node.y - side / 2;
    if (
      alpha <= 0 ||
      side < MIN_COVER_SIDE ||
      left > width ||
      top > height ||
      left + side < 0 ||
      top + side < 0 ||
      !cover.image.complete ||
      cover.image.naturalWidth === 0
    )
      return;
    context.save();
    context.globalAlpha = alpha;
    context.beginPath();
    if (cover.shape === "circle")
      context.arc(node.x, node.y, side / 2, 0, Math.PI * 2);
    else context.roundRect(left, top, side, side, side * CORNER);
    context.strokeStyle = `rgb(${r} ${g} ${b})`;
    context.lineWidth = RING * 2;
    // Half of the stroke falls outside the clip below: a ring of RING pixels around the image.
    context.stroke();
    context.clip();
    context.drawImage(cover.image, left, top, side, side);
    context.restore();
  }

  return {
    /** Sets or removes the image of a node. */
    set(nodeId: NodeId, url: string | null, shape: NodeImageShape) {
      const current = covers.get(nodeId);
      if (current?.url === url && current.shape === shape) return;
      if (current) {
        images.release(current.url);
        covers.delete(nodeId);
        // The view stops drawing without covers, so the last picture goes now.
        if (covers.size === 0)
          context?.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (url) {
        attach();
        covers.set(nodeId, { url, shape, image: images.acquire(url) });
      }
    },

    /** True while at least one node has an image. */
    get active() {
      return covers.size > 0;
    },

    /** Draws all covers. `nodeAt` gives the screen data of a node, or undefined when it is gone. */
    draw(nodeAt: (nodeId: NodeId) => CoverNode | undefined) {
      if (!context) return;
      resize();
      context.clearRect(0, 0, canvas.width, canvas.height);
      const width = container.clientWidth;
      const height = container.clientHeight;
      covers.forEach((cover, nodeId) => {
        const node = nodeAt(nodeId);
        if (node) drawCover(cover, node, width, height);
      });
    },

    dispose() {
      images.clear();
      covers.clear();
      canvas.remove();
    },
  };
}

export type CoverLayer = ReturnType<typeof createCoverLayer>;
