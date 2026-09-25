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
