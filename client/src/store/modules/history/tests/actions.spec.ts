import { actions } from "../actions";
import { getAllLinks } from "@/lib/graph";
vi.mock("@/lib/graph");

const { addChange, undo, redo, addToClickHistory } = actions;

describe("addChange", () => {
  let state;
  let commit;
  let change;
  beforeEach(() => {
    commit = vi.fn();
    change = { data: { nodes: [{ id: 3 }], links: [] }, type: "remove" };
    state = {
      changes: [
        { data: { nodes: [{ id: 1 }], links: [] }, type: "add" },
        { data: { nodes: [{ id: 2 }], links: [] }, type: "add" },
        { data: { nodes: [{ id: 3 }], links: [] }, type: "add" },
      ],
      historyIndex: 1,
    };
  });
  it("replaces all changes after the current historyIndex with the new change", () => {
    addChange({ state, commit }, change);
    const newChanges = [
      { data: { nodes: [{ id: 1 }], links: [] }, type: "add" },
      { data: { nodes: [{ id: 2 }], links: [] }, type: "add" },
      { data: { nodes: [{ id: 3 }], links: [] }, type: "remove" },
    ];
    expect(commit).toHaveBeenCalledWith("SET_CHANGES", newChanges);
  });
  it("adds one to the historyIndex", () => {
    addChange({ state, commit }, change);
    expect(commit).toHaveBeenCalledWith("SET_HISTORY_INDEX", 2);
  });
});

describe("undo", () => {
  let state;
  let commit;
  let dispatch;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();

    state = {
      changes: [
        { data: { nodes: [{ id: 1 }], links: [] }, type: "add" },
        { data: { nodes: [{ id: 2 }], links: [] }, type: "add" },
        {
          data: {
            nodes: [{ id: 3 }],
            links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
          },
          type: "add",
        },
      ],
      historyIndex: 2,
    };
    rootState = {
      history: state,
    };
    getAllLinks.mockReturnValue([
      { fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] },
    ]);
  });
  it("removes nodes and links when the last change was of type add", () => {
    undo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(1, "REMOVE_NODE", { id: 3 });
    expect(commit).toHaveBeenNthCalledWith(2, "REMOVE_LINK", {
      fromId: 1,
      toId: 3,
      id: "1👉 3",
      linkTypes: [],
    });
    expect(commit).toHaveBeenNthCalledWith(3, "SET_HISTORY_INDEX", 1);
  });
  it("removes linkTypes when the last change was of type add", () => {
    getAllLinks.mockReturnValue([
      { fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab", "cd"] },
    ]);

    undo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(1, "REMOVE_NODE", { id: 3 });
    expect(commit).toHaveBeenNthCalledWith(2, "UPDATE_LINKTYPES", {
      fromId: 1,
      toId: 3,
      id: "1👉 3",
      linkTypes: ["cd"],
    });
    expect(commit).toHaveBeenNthCalledWith(3, "SET_HISTORY_INDEX", 1);
  });
  it("adds nodes and links when the last change was of type remove", () => {
    state.changes[2] = {
      data: {
        nodes: [{ id: 3 }],
        links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
      },
      type: "remove",
    };

    undo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(1, "ADD_TO_GRAPH", {
      nodes: [{ id: 3 }],
      links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
    });
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
  it("adds nodes and their links when the last change was of type remove", () => {
    state.changes[2] = {
      data: {
        nodes: [
          {
            id: 3,
            links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
          },
        ],
        links: [],
      },
      type: "remove",
    };

    undo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(1, "ADD_TO_GRAPH", {
      nodes: [
        {
          id: 3,
          links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
        },
      ],
      links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
    });
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
});

describe("redo", () => {
  let state;
  let commit;
  let dispatch;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();

    state = {
      changes: [
        { data: { nodes: [{ id: 1 }], links: [] }, type: "add" },
        { data: { nodes: [{ id: 2 }], links: [] }, type: "add" },
        {
          data: {
            nodes: [{ id: 3 }],
            links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
          },
          type: "remove",
        },
      ],
      historyIndex: 1,
    };
    rootState = {
      history: state,
    };
    getAllLinks.mockReturnValue([
      { fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] },
    ]);
  });
  it("removes nodes and links when the next change is of type remove", () => {
    commit.mockImplementationOnce(
      (name, index) => (state.historyIndex = index),
    );
    redo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(2, "REMOVE_NODE", { id: 3 });
    expect(commit).toHaveBeenNthCalledWith(3, "REMOVE_LINK", {
      fromId: 1,
      toId: 3,
      id: "1👉 3",
      linkTypes: [],
    });
  });
  it("removes linkTypes when the next change is of type remove", () => {
    getAllLinks.mockReturnValue([
      { fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab", "cd"] },
    ]);
    commit.mockImplementationOnce(
      (name, index) => (state.historyIndex = index),
    );
    redo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(2, "REMOVE_NODE", { id: 3 });
    expect(commit).toHaveBeenNthCalledWith(3, "UPDATE_LINKTYPES", {
      fromId: 1,
      toId: 3,
      id: "1👉 3",
      linkTypes: ["cd"],
    });
  });
  it("adds one to the historyIndex", () => {
    redo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenCalledWith("SET_HISTORY_INDEX", 2);
  });
  it("adds nodes and links when the next change is of type add", () => {
    state.changes[2] = {
      data: {
        nodes: [{ id: 3 }],
        links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
      },
      type: "add",
    };
    commit.mockImplementationOnce(
      (name, index) => (state.historyIndex = index),
    );
    redo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(2, "ADD_TO_GRAPH", {
      nodes: [{ id: 3 }],
      links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
    });
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
  it("adds nodes and their links when the next change is of type add", () => {
    state.changes[2] = {
      data: {
        nodes: [
          {
            id: 3,
            links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
          },
        ],
        links: [],
      },
      type: "add",
    };
    commit.mockImplementationOnce(
      (name, index) => (state.historyIndex = index),
    );
    redo({ state, commit, dispatch, rootState });
    expect(commit).toHaveBeenNthCalledWith(2, "ADD_TO_GRAPH", {
      nodes: [
        {
          id: 3,
          links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
        },
      ],
      links: [{ fromId: 1, toId: 3, id: "1👉 3", linkTypes: ["ab"] }],
    });
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
});

describe("addToClickHistory", () => {
  let rootState;
  let commit;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      configurations: {
        name: "dummy",
      },
    };
  });
  it("adds a history item to the click history", () => {
    addToClickHistory(
      { rootState, commit },
      { node: { id: "1" }, action: "add" },
    );
    expect(commit).toHaveBeenCalledWith("ADD_TO_CLICK_HISTORY", {
      node: { id: "1" },
      data: {
        node: { id: "1" },
        timestamp: expect.anything(),
        action: "add",
        configuration: rootState.configurations,
      },
    });
  });
});

describe("move changes", () => {
  const moves = [
    {
      nodeId: "a",
      from: { x: 1, y: 2, pinned: false },
      to: { x: 10, y: 20, z: 0, pinned: true },
    },
  ];
  const compass = { nodeLabel: "album" };
  const change = {
    type: "move",
    data: { nodes: [], links: [] },
    moves,
    compass,
  };

  it("undo puts the nodes where they were, redo where the layout put them", () => {
    const dispatch = vi.fn();
    const state = { historyIndex: 0, changes: [change] };
    const commit = vi.fn((type: string, index: number) => {
      if (type === "SET_HISTORY_INDEX") state.historyIndex = index;
    });
    actions.undo({ state, commit, dispatch, rootState: {} } as never);
    expect(dispatch).toHaveBeenCalledWith("applyMoves", {
      moves,
      direction: "from",
    });
    actions.redo({ state, commit, dispatch, rootState: {} } as never);
    expect(dispatch).toHaveBeenCalledWith("applyMoves", {
      moves,
      direction: "to",
    });
    // Undo takes the compass axes away, redo shows them again.
    expect(commit).toHaveBeenCalledWith("SET_COMPASS", null);
    expect(commit).toHaveBeenCalledWith("SET_COMPASS", compass);
  });

  it("applyMoves sets position and pin state, and skips nodes that left the graph", () => {
    const commit = vi.fn();
    const rootState = {
      mainGraph: {
        Graph: { getNode: (id: string) => (id === "a" ? {} : undefined) },
      },
    };
    actions.applyMoves({ commit, rootState } as never, {
      moves: [...moves, { ...moves[0], nodeId: "gone" }],
      direction: "to",
    });
    expect(commit.mock.calls).toEqual([
      [
        "SET_NODE_POSITION",
        { nodeId: "a", xPosition: 10, yPosition: 20, zPosition: 0 },
      ],
      ["PIN_NODE", { id: "a" }],
      ["RERENDER_GRAPH"],
    ]);
  });
});
