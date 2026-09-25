// @vitest-environment jsdom
import { getAllNodes } from "@/lib/graph";
import { actions, placeNodeLabel } from "../actions";
vi.mock("@/lib/graph");

const {
  moveToNode,
  fitGraphToScreen,
  fitGraphToSelection,
  fitGraphToNodes,
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

describe("placeNodeLabels", () => {
  let commit;
  let rootState;
  const toScreen = vi.fn();
  beforeEach(() => {
    commit = vi.fn();
    toScreen.mockReset();
    rootState = {
      mainGraph: {
        renderState: {
          Renderer: {
            getGraphics: () => ({ toScreen }),
          },
        },
      },
      graph_camera: {
        nodeLabels: {},
      },
    };
    Object.defineProperty(window, "innerWidth", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1000,
      configurable: true,
    });
  });
  it("doesn't do anything when node label doesn't exist", () => {
    toScreen.mockReturnValue({ x: -50, y: 20, visible: true });
    const ui = { node: { id: "Genre/123" } };
    placeNodeLabel({ x: 1, y: 1 }, ui, rootState, commit);
    expect(commit).not.toHaveBeenCalled();
  });
  it("deletes nodeLabel when the node leaves the screen", () => {
    toScreen.mockReturnValue({ x: 20, y: 20, visible: false });
    rootState.graph_camera.nodeLabels["Genre/123"] = {
      id: "Genre/123",
      data: "someData",
    };
    const ui = { node: { id: "Genre/123" } };
    placeNodeLabel({ x: 20, y: 20 }, ui, rootState, commit);
    expect(commit).toHaveBeenCalledWith("REMOVE_NODE_LABEL", {
      id: "Genre/123",
      data: "someData",
    });
  });
  it("adds label when node is on screen", () => {
    toScreen.mockReturnValue({ x: 150, y: 150, visible: true });
    const ui = {
      node: {
        id: "Genre/125",
        data: {
          name: "someData",
        },
      },
      color: Number.parseInt("ffffffff", 16),
    };
    placeNodeLabel({ x: 200, y: 200 }, ui, rootState, commit);
    expect(commit).toHaveBeenCalledWith("ADD_NODE_LABEL", {
      colors: {
        backgroundColor: "#ffffffff",
        textColor: "black",
      },
      coordinates: {
        x: 150,
        y: 150,
      },
      dataKey: "name",
      id: "Genre/125",
      data: {
        name: "someData",
      },
    });
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
