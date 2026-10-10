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

/**
 * The translation (in client pixels) that shows the graph point at the center of a viewport
 * of the given size, at the given zoom scale.
 */
export function centerOffset(
  point: { x: number; y: number },
  scale: number,
  width: number,
  height: number,
) {
  return { x: width / 2 - point.x * scale, y: height / 2 - point.y * scale };
}

/**
 * Runs the function and returns the window "resize" listeners that it adds. Viva input events
 * add one that its dispose does not remove.
 */
function collectResizeListeners(run: () => void) {
  const listeners: EventListenerOrEventListenerObject[] = [];
  const add = window.addEventListener;
  window.addEventListener = function (
    this: Window,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === "resize") listeners.push(listener);
    add.call(this, type, listener, options);
  } as typeof window.addEventListener;
  try {
    run();
  } finally {
    window.addEventListener = add;
  }
  return listeners;
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

  /**
   * Centers the view on a point in graph coordinates. Viva's own moveTo centers on the middle
   * of the container at the time the renderer started, and its resize handler moves that
   * point, so after a resize the view went to the wrong place.
   */
  function centerOn(point: { x: number; y: number }) {
    const offset = centerOffset(
      point,
      renderer.getTransform().scale,
      container.clientWidth,
      container.clientHeight,
    );
    webglGraphics.graphCenterChanged(offset.x, offset.y);
    renderer.rerender();
  }

  /** Keeps the graph point at the center of the view in the center when the size changes. */
  function updateSize() {
    const canvas = webglGraphics.getGraphicsRoot();
    const center = webglGraphics.transformClientToGraphCoordinates({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
    webglGraphics.updateSize();
    centerOn(center);
  }

  const graphics: GraphGraphics = {
    getNodeUI: (nodeId) => webglGraphics.getNodeUI(nodeId),
    getLinkUI: (linkId) => webglGraphics.getLinkUI(linkId),
    updateSize: () => updateSize(),
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

  const resizeListeners: EventListenerOrEventListenerObject[] = [];
  /** Runs Viva code that may create its input events, and keeps their resize listener. */
  function trackResizeListeners(run: () => void) {
    resizeListeners.push(...collectResizeListeners(run));
  }

  let zoomTimer: ReturnType<typeof setTimeout> | undefined;
  /** Zooms step by step until the renderer reaches the scale. A new zoom stops the previous one. */
  function zoomToScale(desiredScale: number) {
    clearTimeout(zoomTimer);
    const zoomIn = (currentScale: number) => {
      if (desiredScale > currentScale) {
        const next = renderer.zoomIn();
        zoomTimer = setTimeout(() => zoomIn(next), ZOOM_STEP_DELAY);
      }
    };
    const zoomOut = (currentScale: number) => {
      if (desiredScale < currentScale) {
        const next = renderer.zoomOut();
        zoomTimer = setTimeout(() => zoomOut(next), ZOOM_STEP_DELAY);
      }
    };
    const current = renderer.getTransform().scale;
    if (current > desiredScale) zoomOut(current);
    else zoomIn(current);
  }

  const view: GraphRenderer = {
    mode: "2d",
    // The resize handler of the renderer centers the whole graph with a wrong offset.
    // updateSize keeps the view in place instead.
    run: () =>
      collectResizeListeners(() => void renderer.run()).forEach((listener) =>
        window.removeEventListener("resize", listener),
      ),
    rerender: () => renderer.rerender(),
    dispose: () => {
      clearTimeout(zoomTimer);
      renderer.dispose();
      resizeListeners
        .splice(0)
        .forEach((listener) => window.removeEventListener("resize", listener));
    },
    pause: () => renderer.pause(),
    resume: () => renderer.resume(),
    getGraphics: () => graphics,
    getLayout: () => graphLayout,
    createInputEvents: () => {
      let vivaEvents = {} as GraphInputEvents;
      trackResizeListeners(() => {
        vivaEvents = Viva.Graph.webglInputEvents(
          webglGraphics,
          graph,
        ) as unknown as GraphInputEvents;
      });
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
      centerOn(center);
      zoomToScale(scale);
    },
    moveTo: (x, y) => centerOn({ x, y }),
    getTransform: () => renderer.getTransform(),
    zoomIn: () => renderer.zoomIn(),
    zoomOut: () => renderer.zoomOut(),
    on: (event, callback) => void renderer.on(event, callback),
  };
  return view;
};
