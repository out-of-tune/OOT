// @vitest-environment jsdom
import createGraph from "ngraph.graph";
import { PerspectiveCamera, Vector3 } from "three";
import { createThreeView } from "../threeView";

// A stand-in for 3d-force-graph: it records the calls and needs no WebGL.
const engine = vi.hoisted(() => ({ instances: [] as FakeForceGraph[] }));

interface FakeForceGraph {
  data: { nodes: Record<string, unknown>[]; links: Record<string, unknown>[] };
  velocityDecay: number;
  destroyed: boolean;
  handlers: Record<string, (...args: unknown[]) => void>;
}

vi.mock("3d-force-graph", () => {
  class ForceGraph3D {
    state: FakeForceGraph = {
      data: { nodes: [], links: [] },
      velocityDecay: 0,
      destroyed: false,
      handlers: {},
    };
    cameraObject = new PerspectiveCamera(75, 1, 0.1, 10000);
    controlsObject = { target: new Vector3(), addEventListener: vi.fn() };
    constructor() {
      this.cameraObject.position.set(0, 0, 400);
      // The real engine updates the camera matrices on every frame.
      this.cameraObject.updateMatrixWorld();
      engine.instances.push(this.state);
    }
    backgroundColor() {
      return this;
    }
    showNavInfo() {
      return this;
    }
    width() {
      return this;
    }
    height() {
      return this;
    }
    nodeLabel() {
      return this;
    }
    nodeThreeObject() {
      return this;
    }
    linkMaterial() {
      return this;
    }
    linkWidth() {
      return this;
    }
    d3VelocityDecay(value: number) {
      this.state.velocityDecay = value;
      return this;
    }
    d3ReheatSimulation() {
      return this;
    }
    graphData(data: FakeForceGraph["data"]) {
      this.state.data = data;
      return this;
    }
    camera() {
      return this.cameraObject;
    }
    controls() {
      return this.controlsObject;
    }
    cameraPosition() {
      return this;
    }
    zoomToFit() {
      return this;
    }
    onNodeHover(callback: () => void) {
      this.state.handlers.hover = callback;
      return this;
    }
    onNodeClick(callback: () => void) {
      this.state.handlers.click = callback;
      return this;
    }
    onNodeDrag(callback: () => void) {
      this.state.handlers.drag = callback;
      return this;
    }
    onNodeDragEnd(callback: () => void) {
      this.state.handlers.dragEnd = callback;
      return this;
    }
    _destructor() {
      this.state.destroyed = true;
    }
  }
  return { default: ForceGraph3D };
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup() {
  const graph = createGraph();
  const container = document.createElement("div");
  document.body.appendChild(container);
  const view = createThreeView({
    graph,
    container,
    layoutOptions: {
      springLength: 5,
      springCoeff: 0.00005,
      dragCoeff: 0.01,
      gravity: -10.2,
    },
  });
  const fake = engine.instances[engine.instances.length - 1];
  return { graph, container, view, fake };
}

describe("threeView", () => {
  it("mirrors added and removed nodes and links", async () => {
    const { graph, fake } = setup();
    graph.addNode("a", { label: "genre" });
    graph.addNode("b", { label: "genre" });
    graph.addLink("a", "b");
    await flush();
    expect(fake.data.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(fake.data.links).toHaveLength(1);

    graph.removeNode("b");
    await flush();
    expect(fake.data.nodes.map((node) => node.id)).toEqual(["a"]);
    expect(fake.data.links).toHaveLength(0);
  });

  it("maps RGBA colors to material color and opacity, and size to scale", async () => {
    const { graph, view, fake } = setup();
    graph.addNode("a", { label: "genre" });
    const ui = view.getGraphics().getNodeUI("a");
    ui.color = 0xff000080;
    ui.size = 20;
    await flush();
    const mesh = fake.data.nodes[0].mesh as {
      material: {
        color: { r: number; g: number; b: number };
        opacity: number;
        visible: boolean;
      };
      scale: { x: number };
    };
    expect(mesh.material.color).toMatchObject({ r: 1, g: 0, b: 0 });
    expect(mesh.material.opacity).toBeCloseTo(0x80 / 0xff);
    expect(mesh.scale.x).toBeCloseTo(7);
    ui.color = 0xff000000;
    expect(mesh.material.visible).toBe(false);
  });

  it("pins a node at its position and releases it", () => {
    const { graph, view } = setup();
    graph.addNode("a", { label: "genre" });
    const layout = view.getLayout();
    layout.setNodePosition("a", 1, 2, 3);
    expect(layout.getNodePosition("a")).toEqual({ x: 1, y: 2, z: 3 });
    expect(layout.isNodePinned({ id: "a" })).toBe(false);
    layout.pinNode({ id: "a" }, true);
    expect(layout.isNodePinned({ id: "a" })).toBe(true);
    layout.pinNode({ id: "a" }, false);
    expect(layout.isNodePinned({ id: "a" })).toBe(false);
  });

  it("puts nodes without depth on the z = 0 plane", () => {
    const { graph, view } = setup();
    graph.addNode("a", { label: "genre" });
    view.getLayout().setNodePosition("a", 5, 6);
    expect(view.getLayout().getNodePosition("a")).toEqual({ x: 5, y: 6, z: 0 });
  });

  it("projects the camera target to the middle of the screen", () => {
    const { container, view } = setup();
    container.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 800, height: 600 }) as DOMRect;
    const host = container.firstElementChild as HTMLElement;
    host.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 800, height: 600 }) as DOMRect;
    const point = view.getGraphics().toScreen({ x: 0, y: 0, z: 0 });
    expect(point.visible).toBe(true);
    expect(point.x).toBeCloseTo(400);
    expect(point.y).toBeCloseTo(300);
    expect(view.getGraphics().toScreen({ x: 0, y: 0, z: 1000 }).visible).toBe(
      false,
    );
  });

  it("stops and restarts the node motion", () => {
    const { view, fake } = setup();
    view.pause();
    expect(fake.velocityDecay).toBe(1);
    view.resume();
    expect(fake.velocityDecay).toBe(0.4);
  });

  it("reports hover, click and drag with the graph node", () => {
    const { graph, view, fake } = setup();
    const graphNode = graph.addNode("a", { label: "genre" });
    const calls: string[] = [];
    view
      .createInputEvents()
      .mouseEnter((node) => calls.push(`enter ${node.id}`))
      .mouseLeave((node) => calls.push(`leave ${node.id}`))
      .click((node) => calls.push(`click ${node.id}`))
      .mouseDown((node) => calls.push(`down ${node.id}`))
      .mouseMove((node) => calls.push(`move ${node.id}`))
      .mouseUp((node) => calls.push(`up ${node.id}`));
    const viewNode = { node: graphNode };
    fake.handlers.hover(viewNode, null);
    fake.handlers.hover(null, viewNode);
    fake.handlers.click(viewNode);
    fake.handlers.drag(viewNode);
    fake.handlers.drag(viewNode);
    fake.handlers.dragEnd(viewNode);
    expect(calls).toEqual([
      "enter a",
      "leave a",
      "click a",
      "down a",
      "move a",
      "move a",
      "up a",
    ]);
  });

  it("stops listening to the graph and removes its element on dispose", async () => {
    const { graph, container, view, fake } = setup();
    view.dispose();
    expect(fake.destroyed).toBe(true);
    expect(container.children).toHaveLength(0);
    graph.addNode("late", { label: "genre" });
    await flush();
    expect(fake.data.nodes).toHaveLength(0);
  });
});
