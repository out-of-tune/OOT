// @vitest-environment jsdom
import { fitTransform } from "../vivaView";

// The math of the 2D fit. It moved here from the graph_camera actions with the view contract.
describe("fitTransform", () => {
  it("centers on the middle of the nodes", () => {
    const { center } = fitTransform(
      [
        { x: 200, y: 200 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
      ],
      1000,
      1000,
    );
    expect(center).toEqual({ x: 150, y: 150 });
  });

  it("zooms to scale 2 when only one node is given", () => {
    expect(fitTransform([{ x: 100, y: 100 }], 500, 500).scale).toBe(2);
  });

  it("zooms so that the nodes fill three quarters of the screen", () => {
    const desiredScale = 500 / 600;
    const { scale } = fitTransform(
      [
        { x: 100, y: 100 },
        { x: 700, y: 700 },
      ],
      500,
      500,
    );
    expect(scale).toBeCloseTo(desiredScale * 0.75);
  });

  it("zooms no more than 2", () => {
    const { scale } = fitTransform(
      [
        { x: 100, y: 100 },
        { x: 150, y: 150 },
      ],
      500,
      500,
    );
    expect(scale).toBe(2);
  });
});

describe("createVivaView input events", () => {
  it("returns nothing to Viva, so a Promise result does not stop the node drag", async () => {
    const { default: Viva } = await import("vivagraphjs");
    const registered: Record<string, (node: unknown) => unknown> = {};
    const fakeEvents = new Proxy(
      {},
      {
        get:
          (_target, name: string) => (callback: (node: unknown) => unknown) => {
            registered[name] = callback;
            return fakeEvents;
          },
      },
    );
    vi.spyOn(Viva.Graph, "webglInputEvents").mockReturnValue(
      fakeEvents as never,
    );
    vi.spyOn(Viva.Graph.View, "webglGraphics").mockReturnValue({} as never);
    vi.spyOn(Viva.Graph.View, "renderer").mockReturnValue({} as never);
    vi.spyOn(Viva.Graph.Layout, "forceDirected").mockReturnValue({} as never);
    const { createVivaView } = await import("../vivaView");
    const view = createVivaView({
      graph: {} as never,
      container: {} as never,
      layoutOptions: {} as never,
    });
    const callback = vi.fn(() => Promise.resolve());
    view.createInputEvents().mouseDown(callback);
    expect(registered.mouseDown({ id: "a" })).toBeUndefined();
    expect(callback).toHaveBeenCalledWith({ id: "a" });
  });
});

describe("createVivaView lifecycle", () => {
  async function setupView(inputEvents: () => unknown) {
    const { default: Viva } = await import("vivagraphjs");
    let scale = 1;
    const renderer = {
      run: vi.fn(),
      dispose: vi.fn(),
      moveTo: vi.fn(),
      rerender: vi.fn(),
      getTransform: () => ({ scale }),
      zoomIn: () => (scale *= 1.1),
      zoomOut: () => (scale /= 1.1),
    };
    const positions: Record<string, { x: number; y: number }> = {
      a: { x: 0, y: 0 },
      b: { x: 100, y: 100 },
      c: { x: 10000, y: 10000 },
    };
    vi.spyOn(Viva.Graph, "webglInputEvents").mockImplementation(
      inputEvents as never,
    );
    vi.spyOn(Viva.Graph.View, "webglGraphics").mockReturnValue({
      getNodeUI: (id: string) => ({ position: positions[id] }),
    } as never);
    vi.spyOn(Viva.Graph.View, "renderer").mockReturnValue(renderer as never);
    vi.spyOn(Viva.Graph.Layout, "forceDirected").mockReturnValue({} as never);
    const { createVivaView } = await import("../vivaView");
    const view = createVivaView({
      graph: {} as never,
      container: { clientWidth: 1000, clientHeight: 1000 } as never,
      layoutOptions: {} as never,
    });
    return { view, getScale: () => scale };
  }
  const node = (id: string) => ({ id, data: {} }) as never;

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("stops the previous zoom when a new fit starts", async () => {
    vi.useFakeTimers();
    const { view, getScale } = await setupView(() => ({}));
    view.fitToNodes([node("a"), node("b")]);
    view.fitToNodes([node("a"), node("c")]);
    vi.advanceTimersByTime(10_000);
    expect(vi.getTimerCount()).toBe(0);
    expect(getScale()).toBeLessThan(0.075);
    expect(getScale()).toBeGreaterThan(0.075 / 1.1);
  });

  it("removes the window resize listener of the Viva input events on dispose", async () => {
    const onResize = vi.fn();
    const { view } = await setupView(() => {
      window.addEventListener("resize", onResize);
      return { mouseDown: vi.fn() };
    });
    view.createInputEvents();
    view.dispose();
    window.dispatchEvent(new Event("resize"));
    expect(onResize).not.toHaveBeenCalled();
  });
});
