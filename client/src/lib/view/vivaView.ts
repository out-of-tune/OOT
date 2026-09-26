import Viva from "vivagraphjs";
import type { GraphNode, Position } from "@/types/graph";
import type {
  GraphGraphics,
  GraphInputEvents,
  GraphLayout,
  GraphRenderer,
  NodeUI,
  ViewFactory,
} from "./contract";

const INPUT_EVENTS = [
  "mouseEnter",
  "mouseLeave",
  "click",
  "mouseDown",
  "mouseMove",
  "mouseUp",
] as const;

/** Largest zoom level that fit-to-nodes uses. */
const MAX_FIT_SCALE = 2;
/** Delay between zoom steps of the zoom animation, in milliseconds. */
const ZOOM_STEP_DELAY = 16;

/** The part of the viewport that a fit may fill. */
const FIT_PADDING = 0.75;

/**
 * Center and zoom scale that fit the positions into a viewport of the given size.
 * The zoom never goes above MAX_FIT_SCALE, and a single point gets MAX_FIT_SCALE.
 */
export function fitTransform(
  positions: Position[],
  width: number,
  height: number,
) {
  const xs = positions.map((position) => position.x);
  const ys = positions.map((position) => position.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const desiredScale = Math.min(width / (maxX - minX), height / (maxY - minY));
  const padded = desiredScale * FIT_PADDING;
  const usable =
    Number.isFinite(desiredScale) &&
    desiredScale !== 0 &&
    padded < MAX_FIT_SCALE;
  return {
    center: { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 },
    scale: usable ? padded : MAX_FIT_SCALE,
  };
}

/** 2D view: VivaGraphJS with a WebGL renderer and a force directed layout. */
export const createVivaView: ViewFactory = ({
  graph,
  container,
  layoutOptions,
}) => {
  const webglGraphics = Viva.Graph.View.webglGraphics({
    clearColor: true,
    clearColorValue: { r: 0, g: 0, b: 0, a: 1 },
  });
  const layout = Viva.Graph.Layout.forceDirected(graph, { ...layoutOptions });
  const renderer = Viva.Graph.View.renderer(graph, {
    layout,
    container,
    graphics: webglGraphics,
  });

  const graphics: GraphGraphics = {
    getNodeUI: (nodeId) => webglGraphics.getNodeUI(nodeId),
    getLinkUI: (linkId) => webglGraphics.getLinkUI(linkId),
    updateSize: (width, height) => webglGraphics.updateSize(width, height),
    toScreen: (position) => ({
      ...webglGraphics.transformGraphToClientCoordinates({
        x: position.x,
        y: position.y,
      }),
      visible: true,
    }),
    placeNode: (callback) => {
      webglGraphics.placeNode((ui, position) =>
        callback(ui as NodeUI, position),
      );
    },
  };

  const graphLayout: GraphLayout = {
    getNodePosition: (nodeId) => layout.getNodePosition(nodeId),
    setNodePosition: (nodeId, x, y) => layout.setNodePosition(nodeId, x, y),
    pinNode: (node, isPinned) => layout.pinNode(node as GraphNode, isPinned),
    isNodePinned: (node) => layout.isNodePinned(node as GraphNode),
  };

  /** Zooms step by step until the renderer reaches the scale. */
  function zoomToScale(desiredScale: number) {
    const zoomIn = (currentScale: number) => {
      if (desiredScale > currentScale) {
        const next = renderer.zoomIn();
        setTimeout(() => zoomIn(next), ZOOM_STEP_DELAY);
      }
    };
    const zoomOut = (currentScale: number) => {
      if (desiredScale < currentScale) {
        const next = renderer.zoomOut();
        setTimeout(() => zoomOut(next), ZOOM_STEP_DELAY);
      }
    };
    const current = renderer.getTransform().scale;
    if (current > desiredScale) zoomOut(current);
    else zoomIn(current);
  }

  const view: GraphRenderer = {
    mode: "2d",
    run: () => void renderer.run(),
    rerender: () => renderer.rerender(),
    dispose: () => renderer.dispose(),
    pause: () => renderer.pause(),
    resume: () => renderer.resume(),
    getGraphics: () => graphics,
    getLayout: () => graphLayout,
    createInputEvents: () => {
      const vivaEvents = Viva.Graph.webglInputEvents(
        webglGraphics,
        graph,
      ) as unknown as GraphInputEvents;
      // Viva reads a truthy callback result as "handled" and then skips its own node drag.
      // Callbacks often return a Promise (of dispatch), so the result is dropped here.
      const events = {} as GraphInputEvents;
      for (const name of INPUT_EVENTS) {
        events[name] = (callback) => {
          vivaEvents[name]((node) => void callback(node));
          return events;
        };
      }
      return events;
    },
    fitToNodes: (nodes) => {
      if (nodes.length === 0) return;
      const { center, scale } = fitTransform(
        nodes.map((node) => webglGraphics.getNodeUI(node.id).position),
        container.clientWidth,
        container.clientHeight,
      );
      renderer.moveTo(center.x, center.y);
      renderer.rerender();
      zoomToScale(scale);
    },
    moveTo: (x, y) => {
      renderer.moveTo(x, y);
      renderer.rerender();
    },
    getTransform: () => renderer.getTransform(),
    zoomIn: () => renderer.zoomIn(),
    zoomOut: () => renderer.zoomOut(),
    on: (event, callback) => void renderer.on(event, callback),
  };
  return view;
};
