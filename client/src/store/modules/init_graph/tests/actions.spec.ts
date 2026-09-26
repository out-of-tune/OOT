import { actions } from "../actions";

const { initGraph, setGraphContainer, disposeGraph } = actions;

describe("initGraph", () => {
  let commit;
  let dispatch;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
  });
  it("creates graph", () => {
    initGraph({
      commit,
      dispatch,
    });
    expect(commit).toHaveBeenCalledWith("CREATE_GRAPH");
  });
  it("sets renderer", () => {
    initGraph({
      commit,
      dispatch,
    });
    expect(commit).toHaveBeenCalledWith("SET_RENDERER");
  });
  it("initializes events", () => {
    initGraph({
      commit,
      dispatch,
    });

    expect(dispatch).toHaveBeenCalledWith("initEvents");
  });
  it("starts renderer", () => {
    initGraph({
      commit,
      dispatch,
    });

    expect(commit).toHaveBeenCalledWith("START_RENDERER");
  });
});

describe("setGraphContainer", () => {
  const commit = vi.fn();
  it("calls the right mutation", () => {
    const graphContainer = {
      id: "test",
    };
    setGraphContainer(
      {
        commit,
      },
      graphContainer,
    );
    expect(commit).toHaveBeenCalledWith("SET_GRAPHCONTAINER", graphContainer);
  });
});

describe("the paused layout", () => {
  const pausedState = (renderer) => ({
    viewMode: renderer?.mode ?? "2d",
    mainGraph: {
      graphContainer: {},
      Graph: { forEachNode: () => {} },
      renderState: {
        Renderer: renderer,
        layout: renderer && {
          getNodePosition: () => ({ x: 0, y: 0 }),
          isNodePinned: () => false,
        },
        isRendered: false,
      },
    },
    selection: { selectedNodes: [] },
  });

  it("stays paused after initGraph", async () => {
    const commit = vi.fn();
    await initGraph({ commit, dispatch: vi.fn(), rootState: pausedState() });
    expect(commit.mock.calls.map(([type]) => type).slice(-2)).toEqual([
      "START_RENDERER",
      "PAUSE_RENDERING",
    ]);
  });

  it("stays paused after a switch to the other view", async () => {
    const rootState = pausedState({ mode: "3d" });
    const commit = vi.fn();
    await actions.setViewMode({ commit, dispatch: vi.fn(), rootState }, "2d");
    const types = commit.mock.calls.map(([type]) => type);
    expect(types.indexOf("PAUSE_RENDERING")).toBeGreaterThan(
      types.indexOf("START_RENDERER"),
    );
  });

  it("is not paused when the layout ran", async () => {
    const commit = vi.fn();
    const rootState = pausedState();
    rootState.mainGraph.renderState.isRendered = true;
    await initGraph({ commit, dispatch: vi.fn(), rootState });
    expect(commit).not.toHaveBeenCalledWith("PAUSE_RENDERING");
  });
});

describe("initGraph during the 3D chunk load", () => {
  it("builds no renderer when the graph view closed meanwhile", async () => {
    const rootState = {
      viewMode: "3d",
      mainGraph: {
        graphContainer: {},
        renderState: { Renderer: null, isRendered: true },
      },
    };
    const commit = vi.fn();
    const loading = initGraph({ commit, dispatch: vi.fn(), rootState });
    disposeGraph({
      commit: (type, payload) => {
        if (type === "SET_GRAPHCONTAINER")
          rootState.mainGraph.graphContainer = payload;
      },
    });
    await loading;
    expect(commit).not.toHaveBeenCalledWith("SET_RENDERER", expect.anything());
    expect(commit).not.toHaveBeenCalledWith("START_RENDERER");
  });
});
