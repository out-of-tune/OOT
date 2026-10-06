import createGraph from "ngraph.graph";
import { actions } from "../actions";
import { actions as historyActions } from "../../history/actions";

/** A real graph with a renderer stand-in that keeps positions, sizes and pins. */
function setup(viewMode: "2d" | "3d" = "2d") {
  const graph = createGraph();
  const positions = new Map<string, { x: number; y: number; z?: number }>();
  const pinned = new Set<string>();
  const ui = (id: string) => ({
    size: 10,
    color: 0,
    position: positions.get(id) ?? { x: 0, y: 0 },
  });
  const rootState = {
    viewMode,
    mainGraph: {
      Graph: graph,
      renderState: {
        Renderer: { getGraphics: () => ({ getNodeUI: ui }) },
        layout: { isNodePinned: (node: { id: string }) => pinned.has(node.id) },
      },
    },
    compass: { active: null as unknown },
  };
  const commit = vi.fn((type: string, payload: never) => {
    const { nodeId, xPosition, yPosition, zPosition, id } = (payload ??
      {}) as Record<string, never>;
    if (type === "SET_NODE_POSITION")
      positions.set(nodeId, { x: xPosition, y: yPosition, z: zPosition });
    if (type === "PIN_NODE") pinned.add(id);
    if (type === "UNPIN_NODE") pinned.delete(id);
    if (type === "SET_COMPASS") rootState.compass.active = payload;
  });
  const dispatch = vi.fn((type: string, payload: never) =>
    type === "applyMoves"
      ? historyActions.applyMoves({ commit, rootState } as never, payload)
      : undefined,
  );
  return { graph, positions, pinned, rootState, commit, dispatch };
}

const year = {
  kind: "attribute",
  attribute: "releaseYear",
  label: "Year",
} as const;

it("pins the nodes of the type on the axes and records the move for undo", () => {
  const { graph, positions, pinned, rootState, commit, dispatch } = setup();
  graph.addNode("old", { label: "album", name: "old", releaseYear: 1970 });
  graph.addNode("new", { label: "album", name: "new", releaseYear: 2020 });
  graph.addNode("none", { label: "album", name: "none" });
  graph.addNode("artist", { label: "artist", name: "a" });
  pinned.add("old");
  positions.set("old", { x: 5, y: 6 });
  actions.applyCompass({ commit, dispatch, rootState } as never, {
    nodeLabel: "album",
    xAxis: year,
    yAxis: year,
  });
  expect([...pinned].sort()).toEqual(["new", "none", "old"]);
  expect(positions.get("new")!.x).toBeGreaterThan(positions.get("old")!.x);
  // Larger y is lower on screen in 2D: the newer album is higher.
  expect(positions.get("new")!.y).toBeLessThan(positions.get("old")!.y);
  expect(positions.has("artist")).toBe(false);
  const change = dispatch.mock.calls.find(
    ([type]) => type === "addChange",
  )![1] as {
    type: string;
    moves: { nodeId: string; from: { x: number; pinned: boolean } }[];
    compass: unknown;
  };
  expect(change.type).toBe("move");
  expect(change.compass).toBe(rootState.compass.active);
  expect(
    change.moves.find((move) => move.nodeId === "old")!.from,
  ).toMatchObject({
    x: 5,
    pinned: true,
  });
  expect(rootState.compass.active).toMatchObject({
    nodeLabel: "album",
    xRange: [1970, 2020],
    up: -1,
    // "old" was pinned before, so release leaves it pinned.
    nodeIds: ["new", "none"],
  });

  // Undo puts the nodes back, with their pin state.
  historyActions.applyMoves({ commit, rootState } as never, {
    moves: change.moves as never,
    direction: "from",
  });
  expect(positions.get("old")).toMatchObject({ x: 5, y: 6 });
  expect([...pinned]).toEqual(["old"]);
});

it("places on the z = 0 plane in 3D, with larger y higher", () => {
  const { graph, positions, rootState, commit, dispatch } = setup("3d");
  graph.addNode("old", { label: "album", name: "old", releaseYear: 1970 });
  graph.addNode("new", { label: "album", name: "new", releaseYear: 2020 });
  actions.applyCompass({ commit, dispatch, rootState } as never, {
    nodeLabel: "album",
    xAxis: year,
    yAxis: year,
  });
  expect(positions.get("new")).toMatchObject({ z: 0 });
  expect(positions.get("new")!.y).toBeGreaterThan(positions.get("old")!.y);
});

it("tells when the graph has no nodes of the type", () => {
  const { rootState, commit, dispatch } = setup();
  actions.applyCompass({ commit, dispatch, rootState } as never, {
    nodeLabel: "album",
    xAxis: year,
    yAxis: year,
  });
  expect(dispatch).toHaveBeenCalledWith(
    "setInfo",
    "There are no album nodes in the graph",
  );
  expect(commit).not.toHaveBeenCalled();
});

it("release unpins only the nodes that are still in the graph and removes the axes", () => {
  const { graph, pinned, rootState, commit } = setup();
  graph.addNode("a", { label: "album" });
  pinned.add("a");
  rootState.compass.active = { nodeIds: ["a", "gone"] };
  actions.releaseCompass({
    commit,
    state: rootState.compass,
    rootState,
  } as never);
  expect(pinned.size).toBe(0);
  expect(commit).not.toHaveBeenCalledWith("UNPIN_NODE", { id: "gone" });
  expect(rootState.compass.active).toBeNull();
});
