// @vitest-environment jsdom
import { getAllNodes } from "@/lib/graph";
import { actions } from "../actions";
vi.mock("@/lib/graph");

const {
  moveToNode,
  fitGraphToScreen,
  fitGraphToSelection,
  fitGraphToNodes,
  displayNodeLabels,
  removeNodeLabels,
  setNodeLabels,
} = actions;

describe("moveToNode", () => {
  it("commits MOVE_TO with node position", () => {
    const rootState = {
      mainGraph: {
        renderState: {
          layout: {
            getNodePosition: (nodeId) =>
              nodeId === "1" ? { x: 10, y: 10 } : null,
          },
        },
      },
    };
    const node = {
      id: "1",
      data: {},
    };
    const commit = vi.fn();
    moveToNode({ commit, rootState }, node);
    expect(commit).toHaveBeenCalledWith("MOVE_TO", { x: 10, y: 10 });
  });
});

describe("fitGraphToScreen", () => {
  let rootState;
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
    rootState = {
      mainGraph: {
        renderState: {
          layout: {
            getGraphRect: vi.fn(),
          },
          Renderer: {
            getGraphics: vi.fn(),
          },
        },
      },
    };
  });
  it("calls fitGraphToNodes with all nodes", () => {
    getAllNodes.mockReturnValueOnce([{ id: "Node/1" }, { id: "Node/2" }]);
    fitGraphToScreen({ rootState, dispatch });
    expect(dispatch).toHaveBeenCalledWith("fitGraphToNodes", [
      { id: "Node/1" },
      { id: "Node/2" },
    ]);
  });
});

describe("fitGraphToSelection", () => {
  let rootState;
  let commit;
  let dispatch;

  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    rootState = {
      selection: {
        selectedNodes: {
          map: vi.fn(),
          length: 2,
        },
      },
    };
  });

  it("dispatches fit to screen when no nodes are selected", () => {
    rootState.selection.selectedNodes.length = 0;

    fitGraphToSelection({ commit, rootState, dispatch });
    expect(dispatch).toHaveBeenCalledWith("fitGraphToScreen");
  });
  it("dispatches fit to node", () => {
    fitGraphToSelection({ rootState, dispatch });
    expect(dispatch).toHaveBeenCalledWith(
      "fitGraphToNodes",
      rootState.selection.selectedNodes,
    );
  });
});

describe("removeNodeLabels", () => {
  let dispatch;
  let rootState;
  beforeEach(() => {
    dispatch = vi.fn();
    rootState = {
      mainGraph: {
        renderState: {
          Renderer: {
            getGraphics: vi.fn(),
          },
        },
      },
    };
  });
  it("sets nodeLabels to empty object", () => {
    rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
      placeNode: vi.fn(),
    });
    removeNodeLabels({ rootState, dispatch });
    expect(dispatch).toHaveBeenCalledWith("setNodeLabels", {});
  });
  it("deletes placeNode callback", () => {
    const placeNode = vi.fn();
    rootState.mainGraph.renderState.Renderer.getGraphics.mockReturnValue({
      placeNode,
    });
    removeNodeLabels({ rootState, dispatch });
    expect(placeNode).toHaveBeenCalledWith(expect.any(Function));
  });
});
describe("setNodeLabels", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("commits SET_NODE_LABELS", () => {
    setNodeLabels({ commit }, { id: "123" });
    expect(commit).toHaveBeenCalledWith("SET_NODE_LABELS", { id: "123" });
  });
});

describe("displayNodeLabels", () => {
  let commit;
  let rootState;
  let placeNode;
  const toScreen = vi.fn();
  const flush = () => Promise.resolve();
  const ui = (id, color = 0xffffffff) => ({
    node: { id, data: { name: id } },
    color,
  });
  // Calls the installed callback once per node, like one renderer frame.
  const frame = (...uis) =>
    uis.forEach((nodeUI) => placeNode.mock.calls.at(-1)[0](nodeUI, {}));
  beforeEach(() => {
    placeNode = vi.fn();
    toScreen.mockReset();
    rootState = {
      mainGraph: {
        renderState: {
          Renderer: { getGraphics: () => ({ toScreen, placeNode }) },
        },
      },
      graph_camera: { nodeLabels: {} },
    };
    commit = vi.fn((type, labels) => {
      rootState.graph_camera.nodeLabels = labels;
    });
    Object.defineProperty(window, "innerWidth", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1000,
      configurable: true,
    });
    displayNodeLabels({ rootState, commit });
  });

  it("commits the labels of one frame at once", async () => {
    toScreen.mockReturnValue({ x: 150, y: 150, visible: true });
    frame(ui("Genre/1"), ui("Genre/2"));
    await flush();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith("SET_NODE_LABELS", {
      "Genre/1": {
        colors: { backgroundColor: "#ffffffff", textColor: "black" },
        coordinates: { x: 150, y: 150 },
        dataKey: "name",
        id: "Genre/1",
        data: { name: "Genre/1" },
      },
      "Genre/2": expect.objectContaining({ id: "Genre/2" }),
    });
  });

  it("commits nothing while no label changes", async () => {
    toScreen.mockReturnValue({ x: 150, y: 150, visible: true });
    const still = ui("Genre/1");
    frame(still);
    await flush();
    frame(still);
    frame(still);
    await flush();
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("removes the label when the node leaves the screen", async () => {
    toScreen.mockReturnValue({ x: 150, y: 150, visible: true });
    frame(ui("Genre/1"), ui("Genre/2"));
    await flush();
    toScreen.mockReturnValue({ x: 150, y: 150, visible: false });
    frame(ui("Genre/1"));
    await flush();
    expect(Object.keys(rootState.graph_camera.nodeLabels)).toEqual(["Genre/2"]);
  });

  it("does not add labels back after removeNodeLabels", async () => {
    toScreen.mockReturnValue({ x: 150, y: 150, visible: true });
    frame(ui("Genre/1"));
    removeNodeLabels({ rootState, dispatch: vi.fn() });
    await flush();
    expect(commit).not.toHaveBeenCalled();
  });
});

describe("fitGraphToNodes", () => {
  it("does nothing when no nodes are in the call", () => {
    const commit = vi.fn();
    fitGraphToNodes({ commit, rootState: {} }, []);
    expect(commit).not.toHaveBeenCalled();
  });
  it("asks the renderer to fit the nodes", () => {
    const commit = vi.fn();
    const nodes = [{ id: "Node/1" }, { id: "Node/2" }];
    fitGraphToNodes({ commit, rootState: {} }, nodes);
    expect(commit).toHaveBeenCalledWith("FIT_TO_NODES", nodes);
  });
});
