import type { ViewFactory, ViewMode } from "./contract";
import { createVivaView } from "./vivaView";

/**
 * Returns the view factory of a mode. The 3D view, with three.js, is a separate chunk
 * that loads the first time it is needed.
 */
export async function loadViewFactory(mode: ViewMode): Promise<ViewFactory> {
  if (mode === "2d") return createVivaView;
  const { createThreeView } = await import("./threeView");
  return createThreeView;
}

/** Spread of the random depth that nodes without depth get in the 3D view. */
const DEPTH_SPREAD = 100;

/**
 * Depth of a node in the 3D view. Positions from the 2D view have none, and on one plane the
 * 3D layout would keep them flat, so they get a random depth.
 */
export const depthOf = (position: { z?: number }) =>
  position.z ?? (Math.random() - 0.5) * DEPTH_SPREAD;
