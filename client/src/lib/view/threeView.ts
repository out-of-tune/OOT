import ForceGraph3D from "3d-force-graph";
import {
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  Vector3,
  type PerspectiveCamera,
} from "three";
import type { GraphLink, GraphNode, NodeId, Position } from "@/types/graph";
import { rgbaParts } from "@/lib/color";
import type {
  GraphGraphics,
  GraphInputEvents,
  GraphLayout,
  GraphRenderer,
  LinkUI,
  NodeUI,
  ViewFactory,
} from "./contract";

/** Camera distance at which the zoom scale is 1. */
const REFERENCE_DISTANCE = 400;
/** Factor of one zoom step. */
const ZOOM_STEP = 1.25;
/** Sphere radius per unit of node size. */
const SIZE_TO_RADIUS = 0.35;
/** Time for the engine to apply new data before the camera fits it, in milliseconds. */
const ENGINE_TICK_WAIT = 50;
/** Duration of camera moves, in milliseconds. */
const CAMERA_TRANSITION = 600;
/** The part of the view that fitted nodes may fill. */
const FIT_FILL = 0.8;
/** Smallest radius that a fit shows, so one node does not fill the screen. */
const MIN_FIT_RADIUS = 40;
/** Velocity decay of the force simulation while it runs, and while it is paused. */
const VELOCITY_DECAY = { running: 0.4, paused: 1 };

const SPHERE = new SphereGeometry(1, 16, 12);

interface ViewNode {
  id: NodeId;
  node: GraphNode;
  mesh: Mesh<SphereGeometry, MeshLambertMaterial>;
  ui: NodeUI;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

interface ViewLink {
  id: string;
  source: NodeId | ViewNode;
  target: NodeId | ViewNode;
  material: LineBasicMaterial;
  ui: LinkUI;
}

interface OrbitControls {
  target: Vector3;
  addEventListener(event: "change", callback: () => void): void;
}

function applyColor(
  material: MeshLambertMaterial | LineBasicMaterial,
  color: number,
) {
  const { r, g, b, a } = rgbaParts(color);
  material.color.setRGB(r / 255, g / 255, b / 255);
  material.opacity = a;
  material.visible = a > 0;
}

/** 3D view: 3d-force-graph on three.js, with a 3D force layout and an orbit camera. */
/**
 * Camera position and target that show a bounding box in the middle of the view.
 * The camera keeps its viewing direction. `fov` is the vertical field of view in degrees.
 */
export function fitCamera(
  box: { x: [number, number]; y: [number, number]; z: [number, number] },
  direction: Vector3,
  fov: number,
  aspect: number,
) {
  const lookAt = new Vector3(
    (box.x[0] + box.x[1]) / 2,
    (box.y[0] + box.y[1]) / 2,
    (box.z[0] + box.z[1]) / 2,
  );
  const radius = Math.max(
    new Vector3(
      box.x[1] - box.x[0],
      box.y[1] - box.y[0],
      box.z[1] - box.z[0],
    ).length() / 2,
    MIN_FIT_RADIUS,
  );
  const verticalHalf = (fov * Math.PI) / 360;
  const horizontalHalf = Math.atan(Math.tan(verticalHalf) * aspect);
  const halfAngle = Math.min(verticalHalf, horizontalHalf);
  const distance = radius / Math.sin(halfAngle) / FIT_FILL;
  const unit =
    direction.lengthSq() > 0
      ? direction.clone().normalize()
      : new Vector3(0, 0, 1);
  const position = lookAt.clone().add(unit.multiplyScalar(distance));
  return {
    position: { x: position.x, y: position.y, z: position.z },
    lookAt: { x: lookAt.x, y: lookAt.y, z: lookAt.z },
  };
}

export const createThreeView: ViewFactory = ({ graph, container }) => {
  // The library empties its element, so it gets its own. The DOM labels stay a sibling on top.
  const host = document.createElement("div");
  Object.assign(host.style, { position: "absolute", inset: "0", zIndex: "0" });
  container.appendChild(host);

  const nodes = new Map<NodeId, ViewNode>();
  const links = new Map<string, ViewLink>();

  function createViewNode(graphNode: GraphNode): ViewNode {
    const material = new MeshLambertMaterial({ transparent: true });
    const mesh = new Mesh(SPHERE, material);
    let color = 0x009ee8ff;
    let size = 10;
    applyColor(material, color);
    mesh.scale.setScalar(size * SIZE_TO_RADIUS);
    const viewNode: ViewNode = {
      id: graphNode.id,
      node: graphNode,
      mesh,
      ui: {
        node: graphNode,
        get color() {
          return color;
        },
        set color(value: number) {
          color = value;
          applyColor(material, value);
        },
        get size() {
          return size;
        },
        set size(value: number) {
          size = value;
          mesh.scale.setScalar(Math.max(value, 1) * SIZE_TO_RADIUS);
        },
        get position() {
          return { x: viewNode.x ?? 0, y: viewNode.y ?? 0, z: viewNode.z ?? 0 };
        },
      },
    };
    return viewNode;
  }

  function ensureNode(graphNode: GraphNode): ViewNode {
    let viewNode = nodes.get(graphNode.id);
    if (!viewNode) {
      viewNode = createViewNode(graphNode);
      nodes.set(graphNode.id, viewNode);
    }
    return viewNode;
  }

  function removeNode(nodeId: NodeId) {
    nodes.get(nodeId)?.mesh.material.dispose();
    nodes.delete(nodeId);
  }

  function ensureLink(link: GraphLink): ViewLink {
    let viewLink = links.get(link.id);
    if (!viewLink) {
      const material = new LineBasicMaterial({ transparent: true });
      let color = 0xffffffff;
      applyColor(material, color);
      viewLink = {
        id: link.id,
        source: link.fromId,
        target: link.toId,
        material,
        ui: {
          get color() {
            return color;
          },
          set color(value: number) {
            color = value;
            applyColor(material, value);
          },
        },
      };
      links.set(link.id, viewLink);
    }
    return viewLink;
  }

  function removeLink(linkId: string) {
    links.get(linkId)?.material.dispose();
    links.delete(linkId);
  }

  const forceGraph = new ForceGraph3D(host, { controlType: "orbit" })
    .backgroundColor("#000000")
    .showNavInfo(false)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .nodeLabel(() => "")
    .nodeThreeObject((node) => (node as unknown as ViewNode).mesh)
    .linkMaterial((link) => (link as unknown as ViewLink).material)
    .linkWidth(0)
    .d3VelocityDecay(VELOCITY_DECAY.running);

  // After a node drag, 3d-force-graph sends a fake touch "pointerup" to reset the orbit controls.
  // The controls then look for a touch pointer that never existed and throw. This replaces the fake
  // event with a "pointerup" for the pointer that really started the drag.
  let lastPointer = { pointerId: 1, pointerType: "mouse" };
  const rememberPointer = (event: PointerEvent) => {
    lastPointer = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };
  };
  const replaceFakePointerUp = (event: PointerEvent) => {
    if (
      event.isTrusted ||
      event.pointerType !== "touch" ||
      event.pointerId !== 0
    )
      return;
    event.stopImmediatePropagation();
    document.dispatchEvent(new PointerEvent("pointerup", lastPointer));
  };
  host.addEventListener("pointerdown", rememberPointer, true);
  document.addEventListener("pointerup", replaceFakePointerUp, true);

  // The engine reads the whole data set. Changes are collected and pushed once per task.
  let syncScheduled = false;
  function pushData() {
    syncScheduled = false;
    forceGraph.graphData({
      nodes: [...nodes.values()] as never[],
      links: [...links.values()] as never[],
    });
  }
  function scheduleSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    queueMicrotask(() => {
      if (syncScheduled) pushData();
    });
  }

  graph.forEachNode((graphNode) => void ensureNode(graphNode));
  graph.forEachLink((link) => void ensureLink(link));
  scheduleSync();

  type Change = {
    changeType: "add" | "remove" | "update";
    node?: GraphNode;
    link?: GraphLink;
  };
  const onGraphChanged = (changes: unknown[]) => {
    (changes as Change[]).forEach(({ changeType, node, link }) => {
      if (node) {
        if (changeType === "remove") removeNode(node.id);
        else ensureNode(node);
      }
      if (link) {
        if (changeType === "remove") removeLink(link.id);
        else ensureLink(link);
      }
    });
    scheduleSync();
  };
  graph.on("changed", onGraphChanged);

  function requireNode(nodeId: NodeId): ViewNode {
    const existing = nodes.get(nodeId);
    if (existing) return existing;
    const graphNode = graph.getNode(nodeId);
    if (!graphNode) throw new Error(`Node ${nodeId} is not in the graph`);
    return ensureNode(graphNode);
  }

  const camera = () => forceGraph.camera() as PerspectiveCamera;
  const controls = () => forceGraph.controls() as OrbitControls;

  // Zoom scale, derived from the camera distance.
  const scaleListeners: ((scale: number) => void)[] = [];
  const currentScale = () =>
    REFERENCE_DISTANCE /
    Math.max(camera().position.distanceTo(controls().target), 1);
  let lastScale = currentScale();
  controls().addEventListener("change", () => {
    const scale = currentScale();
    if (Math.abs(scale - lastScale) < 1e-3) return;
    lastScale = scale;
    scaleListeners.forEach((listener) => listener(scale));
  });

  /** Moves the camera toward (factor < 1) or away from (factor > 1) its target. */
  function dolly(factor: number) {
    const target = controls().target;
    const offset = camera().position.clone().sub(target).multiplyScalar(factor);
    const position = target.clone().add(offset);
    forceGraph.cameraPosition(
      { x: position.x, y: position.y, z: position.z },
      target,
      0,
    );
    return currentScale();
  }

  // Per-frame callback for DOM labels.
  let placeNodeCallback: ((ui: NodeUI, position: Position) => void) | null =
    null;
  let frame = 0;
  const onFrame = () => {
    if (placeNodeCallback)
      nodes.forEach((viewNode) =>
        placeNodeCallback?.(viewNode.ui, viewNode.ui.position),
      );
    frame = requestAnimationFrame(onFrame);
  };
  frame = requestAnimationFrame(onFrame);

  const graphics: GraphGraphics = {
    getNodeUI: (nodeId) => requireNode(nodeId).ui,
    getLinkUI: (linkId) => {
      const viewLink = links.get(linkId);
      if (viewLink) return viewLink.ui;
      let found: GraphLink | undefined;
      graph.forEachLink((link) => {
        if (link.id === linkId) found = link;
      });
      if (!found) throw new Error(`Link ${linkId} is not in the graph`);
      return ensureLink(found).ui;
    },
    updateSize: (width, height) => void forceGraph.width(width).height(height),
    toScreen: (position) => {
      const projected = new Vector3(
        position.x,
        position.y,
        position.z ?? 0,
      ).project(camera());
      const rect = host.getBoundingClientRect();
      return {
        x: rect.left + ((projected.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - projected.y) / 2) * rect.height,
        visible: projected.z > -1 && projected.z < 1,
      };
    },
    placeNode: (callback) => {
      placeNodeCallback = callback;
    },
  };

  const layout: GraphLayout = {
    getNodePosition: (nodeId) => requireNode(nodeId).ui.position,
    setNodePosition: (nodeId, x, y, z = 0) => {
      const viewNode = requireNode(nodeId);
      Object.assign(viewNode, { x, y, z });
      if (viewNode.fx !== undefined)
        Object.assign(viewNode, { fx: x, fy: y, fz: z });
    },
    pinNode: (node, isPinned) => {
      const viewNode = requireNode(node.id);
      if (isPinned)
        Object.assign(viewNode, {
          fx: viewNode.x ?? 0,
          fy: viewNode.y ?? 0,
          fz: viewNode.z ?? 0,
        });
      else
        Object.assign(viewNode, {
          fx: undefined,
          fy: undefined,
          fz: undefined,
        });
    },
    isNodePinned: (node) => nodes.get(node.id)?.fx !== undefined,
  };

  const view: GraphRenderer = {
    mode: "3d",
    run: () => {},
    // The engine renders on every animation frame, so there is nothing to force.
    rerender: () => {},
    dispose: () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerup", replaceFakePointerUp, true);
      graph.off("changed", onGraphChanged);
      forceGraph._destructor();
      nodes.forEach((viewNode) => viewNode.mesh.material.dispose());
      links.forEach((viewLink) => viewLink.material.dispose());
      host.remove();
    },
    pause: () => void forceGraph.d3VelocityDecay(VELOCITY_DECAY.paused),
    resume: () => {
      forceGraph.d3VelocityDecay(VELOCITY_DECAY.running);
      forceGraph.d3ReheatSimulation();
    },
    getGraphics: () => graphics,
    getLayout: () => layout,
    createInputEvents: () => {
      const handlers: Partial<
        Record<keyof GraphInputEvents, (node: GraphNode) => void>
      > = {};
      let dragging = false;
      forceGraph
        .onNodeHover((node, previous) => {
          if (previous)
            handlers.mouseLeave?.((previous as unknown as ViewNode).node);
          if (node) handlers.mouseEnter?.((node as unknown as ViewNode).node);
          host.style.cursor = node ? "pointer" : "";
        })
        .onNodeClick((node) =>
          handlers.click?.((node as unknown as ViewNode).node),
        )
        .onNodeDrag((node) => {
          const graphNode = (node as unknown as ViewNode).node;
          if (!dragging) {
            dragging = true;
            handlers.mouseDown?.(graphNode);
          }
          handlers.mouseMove?.(graphNode);
        })
        .onNodeDragEnd((node) => {
          dragging = false;
          handlers.mouseUp?.((node as unknown as ViewNode).node);
        });
      const events: GraphInputEvents = {
        mouseEnter: (callback) => ((handlers.mouseEnter = callback), events),
        mouseLeave: (callback) => ((handlers.mouseLeave = callback), events),
        click: (callback) => ((handlers.click = callback), events),
        mouseDown: (callback) => ((handlers.mouseDown = callback), events),
        mouseMove: (callback) => ((handlers.mouseMove = callback), events),
        mouseUp: (callback) => ((handlers.mouseUp = callback), events),
      };
      return events;
    },
    fitToNodes: (fitNodes) => {
      // The camera fits the nodes that the engine has, so pending changes go in first.
      // The engine applies new data on its next tick and may re-aim the camera then,
      // so the fit waits for that tick.
      if (syncScheduled) pushData();
      // zoomToFit of the engine always aims at the origin, so the fit is computed here.
      const ids = new Set(fitNodes.map((node) => node.id));
      setTimeout(() => {
        const box = forceGraph.getGraphBbox((node) => ids.has(String(node.id)));
        if (!box) return;
        const cam = camera();
        const { position, lookAt } = fitCamera(
          box,
          cam.position.clone().sub(controls().target),
          cam.fov,
          cam.aspect,
        );
        forceGraph.cameraPosition(position, lookAt, CAMERA_TRANSITION);
      }, ENGINE_TICK_WAIT);
    },
    moveTo: (x, y, z = 0) => {
      const target = controls().target;
      const offset = camera().position.clone().sub(target);
      const lookAt = new Vector3(x, y, z);
      const position = lookAt.clone().add(offset);
      forceGraph.cameraPosition(
        { x: position.x, y: position.y, z: position.z },
        lookAt,
        CAMERA_TRANSITION,
      );
    },
    getTransform: () => ({ scale: currentScale() }),
    zoomIn: () => dolly(1 / ZOOM_STEP),
    zoomOut: () => dolly(ZOOM_STEP),
    on: (_event, callback) => void scaleListeners.push(callback),
  };
  return view;
};
