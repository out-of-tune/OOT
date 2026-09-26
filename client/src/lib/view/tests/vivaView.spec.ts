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
