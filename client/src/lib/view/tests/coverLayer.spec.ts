// @vitest-environment jsdom
import { COVER_SIDE } from "../contract";
import { createCoverLayer } from "../coverLayer";

const COVER_SCALE = COVER_SIDE["2d"];

/** A 2D context that records what the layer draws. jsdom has no canvas. */
function fakeContext() {
  const calls: { name: string; args: unknown[]; alpha: number }[] = [];
  const context: Record<string, unknown> = { globalAlpha: 1 };
  for (const name of [
    "save",
    "restore",
    "beginPath",
    "arc",
    "roundRect",
    "stroke",
    "clip",
    "drawImage",
    "clearRect",
    "setTransform",
  ])
    context[name] = (...args: unknown[]) =>
      calls.push({ name, args, alpha: context.globalAlpha as number });
  return { context, calls };
}

function setup() {
  const { context, calls } = fakeContext();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as never,
  );
  const container = document.createElement("div");
  Object.defineProperties(container, {
    clientWidth: { value: 800 },
    clientHeight: { value: 600 },
  });
  const onLoad = vi.fn();
  const layer = createCoverLayer(container, onLoad);
  return { layer, calls, container, onLoad };
}

/** Makes the images of the layer count as loaded, as jsdom loads none. */
function loadImages() {
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(
    64,
  );
}

afterEach(() => vi.restoreAllMocks());

it("draws a cover with the alpha of the node, a ring in its color and its shape", () => {
  const { layer, calls, container } = setup();
  loadImages();
  layer.set("a", "a.jpg", "circle");
  layer.set("b", "b.jpg", "square");
  expect(container.querySelector("canvas")).not.toBeNull();
  layer.draw((id) =>
    id === "a"
      ? { x: 100, y: 100, side: 20, color: 0xff000080 }
      : { x: 300, y: 300, side: 20, color: 0x00ff00ff },
  );
  const draws = calls.filter((call) => call.name === "drawImage");
  expect(draws).toHaveLength(2);
  expect(draws[0].alpha).toBeCloseTo(0x80 / 0xff);
  expect(draws[0].args.slice(1)).toEqual([
    100 - (20 * COVER_SCALE) / 2,
    100 - (20 * COVER_SCALE) / 2,
    20 * COVER_SCALE,
    20 * COVER_SCALE,
  ]);
  expect(calls.filter((call) => call.name === "arc")).toHaveLength(1);
  expect(calls.filter((call) => call.name === "roundRect")).toHaveLength(1);
  expect(calls.filter((call) => call.name === "stroke")).toHaveLength(2);
});

it("skips covers that are tiny, transparent, off screen or not loaded", () => {
  const { layer, calls } = setup();
  layer.set("tiny", "t.jpg", "square");
  layer.set("hidden", "h.jpg", "square");
  layer.set("away", "w.jpg", "square");
  layer.draw(() => ({ x: 10, y: 10, side: 20, color: 0xffffffff }));
  // Not loaded yet.
  expect(calls.some((call) => call.name === "drawImage")).toBe(false);
  loadImages();
  layer.draw(
    (id) =>
      ({
        tiny: { x: 10, y: 10, side: 2, color: 0xffffffff },
        hidden: { x: 10, y: 10, side: 20, color: 0xffffff00 },
        away: { x: 5000, y: 10, side: 20, color: 0xffffffff },
      })[id],
  );
  expect(calls.some((call) => call.name === "drawImage")).toBe(false);
});

it("shares one image by URL and lets it go with its last node", () => {
  let made = 0;
  vi.stubGlobal(
    "Image",
    class extends window.Image {
      constructor() {
        super();
        made += 1;
      }
    },
  );
  const { layer } = setup();
  layer.set("a", "same.jpg", "square");
  layer.set("b", "same.jpg", "square");
  expect(made).toBe(1);
  expect(layer.active).toBe(true);
  layer.set("a", null, "square");
  layer.set("b", null, "square");
  expect(layer.active).toBe(false);
  layer.set("c", "same.jpg", "square");
  expect(made).toBe(2);
  vi.unstubAllGlobals();
});
