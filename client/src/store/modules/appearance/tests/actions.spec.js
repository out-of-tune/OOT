import { actions } from "../actions";
import {
  getAllNodes,
  getAllLinks,
  getNodeColor,
  getLinkColor,
} from "@/assets/js/graphHelper";
vi.mock("@/assets/js/graphHelper");
import Viva from "vivagraphjs";

const {
  clusterNodes,
  toggleEdgeVisibility,
  switchRendering,
  rerenderGraph,
  addPendingRequest,
  removePendingRequest,
  storeColors,
  loadColors,
  highlight,
  toggleHighlight,
  clusterLoop,
  fadeOut,
} = actions;

//MISSING cluster nodes

describe("toggleEdgeVisibility", () => {
  it("calls the hide edges function when displayEdges is true", () => {
    const commit = vi.fn();

    let rootState = {
      mainGraph: {
        displayState: {
          displayEdges: true,
        },
      },
    };
    toggleEdgeVisibility({
      rootState,
      commit,
    });
    expect(commit).toHaveBeenCalledWith("HIDE_EDGES");
  });
  it("calls the show edges function when displayEdges is false", () => {
    const commit = vi.fn();

    let rootState = {
      mainGraph: {
        displayState: {
          displayEdges: false,
        },
      },
    };
    toggleEdgeVisibility({
      rootState,
      commit,
    });
    expect(commit).toHaveBeenCalledWith("SHOW_EDGES");
  });
});

describe("switchRendering", () => {
  it("calls the pause rendering mutation when isRendered is true", () => {
    const commit = vi.fn();

    let rootState = {
      mainGraph: {
        renderState: {
          isRendered: true,
        },
      },
    };
    switchRendering({
      rootState,
      commit,
    });
    expect(commit).toHaveBeenCalledWith("PAUSE_RENDERING");
  });
  it("calls the show edges function when displayEdges is false", () => {
    const commit = vi.fn();

    let rootState = {
      mainGraph: {
        renderState: {
          isRendered: false,
        },
      },
    };
    switchRendering({
      rootState,
      commit,
    });
    expect(commit).toHaveBeenCalledWith("RESUME_RENDERING");
  });
});

describe("rerenderGraph", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("rerenders the graph", () => {
    rerenderGraph({ commit });
    expect(commit).toHaveBeenCalledWith("RERENDER_GRAPH");
  });
});

describe("addPendingRequest", () => {
  let commit;
  let state;
  beforeEach(() => {
    commit = vi.fn();
    state = {
      pendingRequestCount: 0,
    };
  });
  it("adds an pending request", () => {
    addPendingRequest({ state, commit });
    expect(commit).toHaveBeenCalledWith("SET_PENDING_REQUEST_COUNT", 1);
  });
});

describe("removesPendingRequest", () => {
  let commit;
  let state;
  beforeEach(() => {
    commit = vi.fn();
    state = {
      pendingRequestCount: 1,
    };
  });
  it("removes an pending request", () => {
    removePendingRequest({ state, commit });
    expect(commit).toHaveBeenCalledWith("SET_PENDING_REQUEST_COUNT", 0);
  });
});

describe("storeColors", () => {
  let commit;
  let rootState;
  let nodes;
  let links;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      mainGraph: {
        Graph: {},
        renderState: {
          Renderer: {
            getGraphics: vi.fn(),
          },
        },
      },
      pendingRequestCount: 1,
    };
    nodes = [
      { id: "Auftrag/1", data: { label: "Auftrag" } },
      { id: "Auftrag/2", data: { label: "Auftrag" } },
    ];
    links = [{ from: "Auftrag/1", to: "Auftrag/2" }];
    getAllNodes.mockReturnValue(nodes);
    getAllLinks.mockReturnValue(links);
    getNodeColor.mockReturnValue("ffffffff");
    getLinkColor.mockReturnValue("000000ff");
  });
  it("saves link and node colors to state", () => {
    storeColors({ rootState, commit });
    expect(commit).toHaveBeenCalledWith("SET_COLORS", {
      links: [
        { color: "000000ff", link: { from: "Auftrag/1", to: "Auftrag/2" } },
      ],
      nodes: [
        {
          color: "ffffffff",
          node: { id: "Auftrag/1", data: { label: "Auftrag" } },
        },
        {
          color: "ffffffff",
          node: { id: "Auftrag/2", data: { label: "Auftrag" } },
        },
      ],
    });
  });
});

describe("loadColors", () => {
  let commit;
  let dispatch;
  let state;
  let nodes;
  let links;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    state = {
      colors: {
        links: [
          { color: "000000ff", link: { from: "Auftrag/1", to: "Auftrag/2" } },
        ],
        nodes: [
          {
            color: "fffaaaff",
            node: { id: "Auftrag/1", data: { label: "Auftrag" } },
          },
          {
            color: "ffffffff",
            node: { id: "Auftrag/2", data: { label: "Auftrag" } },
          },
        ],
      },
    };
    nodes = [
      { id: "Auftrag/1", data: { label: "Auftrag" } },
      { id: "Auftrag/2", data: { label: "Auftrag" } },
    ];
    links = [{ from: "Auftrag/1", to: "Auftrag/2" }];
  });
  it("sets node colors", () => {
    loadColors({ state, dispatch, commit });
    expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR", {
      node: "Auftrag/1",
      color: "fffaaaff",
    });
    expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR", {
      node: "Auftrag/2",
      color: "ffffffff",
    });
  });
  it("sets link colors", () => {
    loadColors({ state, dispatch, commit });
    expect(commit).toHaveBeenCalledWith("SET_EDGE_COLOR", {
      color: "000000ff",
      link: { from: "Auftrag/1", to: "Auftrag/2" },
    });
  });
  it("rerenders graph", () => {
    loadColors({ state, dispatch, commit });
    expect(dispatch).toHaveBeenCalledWith("rerenderGraph");
  });
});

describe("highlight", () => {
  let commit;
  let dispatch;
  let rootState;
  let allLinks;
  let allNodes;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    rootState = {
      mainGraph: {
        Graph: Viva.Graph.graph(),
      },
    };
    allLinks = [
      { id: "1to2", fromId: "Auftrag/1", toId: "Auftrag/2" },
      { id: "2to3", fromId: "Auftrag/2", toId: "Auftrag/3" },
    ];
    allNodes = [
      { id: "Auftrag/1", data: { label: "Auftrag" }, links: [allLinks[0]] },
      { id: "Auftrag/2", data: { label: "Auftrag" }, links: [allLinks[0]] },
      { id: "Auftrag/3", data: { label: "Auftrag" }, links: [] },
    ];
    getAllNodes.mockReturnValue(allNodes);
    getAllLinks.mockReturnValue(allLinks);
    allNodes.forEach((node) =>
      rootState.mainGraph.Graph.addNode(node.id, node.data),
    );
    allLinks.forEach((link) =>
      rootState.mainGraph.Graph.addLink(link.fromId, link.toId),
    );
  });
  it("sets all not highlighted nodes transparent", () => {
    highlight({ rootState, dispatch, commit }, allNodes[0]);
    expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR", {
      node: "Auftrag/3",
      color: parseInt("77777733", 16),
    });
  });
  it("sets all highlighted nodes solid", () => {
    highlight({ rootState, dispatch, commit }, allNodes[0]);
    expect(dispatch).toHaveBeenCalledWith("setNodeOpacity", {
      node: { id: "Auftrag/2" },
      opacity: "ff",
    });
    expect(dispatch).toHaveBeenCalledWith("setNodeOpacity", {
      node: { id: "Auftrag/1" },
      opacity: "ff",
    });
  });
  it("sets all not highlighted nodes transparent", () => {
    highlight({ rootState, dispatch, commit }, allNodes[0]);
    expect(commit).toHaveBeenCalledWith("SET_EDGE_COLOR", {
      link: allLinks[1],
      color: parseInt("77777733", 16),
    });
  });
  it("sets all highlighted links solid", () => {
    highlight({ rootState, dispatch, commit }, allNodes[0]);
    expect(dispatch).toHaveBeenCalledWith("setLinkOpacity", {
      link: { id: allLinks[0].id },
      opacity: "ff",
    });
  });
  it("rerenders graph", () => {
    highlight({ rootState, dispatch, commit }, allNodes[0]);
    expect(dispatch).toHaveBeenCalledWith("rerenderGraph");
  });
  it("only highlights node when it has no connections", () => {
    highlight({ rootState, dispatch, commit }, allNodes[2]);
    expect(dispatch).toHaveBeenCalledWith("setNodeOpacity", {
      node: { id: "Auftrag/3" },
      opacity: "ff",
    });
  });
});

describe("toggleHighlight", () => {
  let commit;
  let state;
  beforeEach(() => {
    commit = vi.fn();
    state = {
      highligh: false,
    };
  });
  it("swaps highlight active", () => {
    toggleHighlight({ state, commit });
    expect(commit).toHaveBeenCalledWith("SET_HIGHLIGHT_ACTIVE", true);
  });
});

describe("clusterLoop", () => {
  let dispatch;
  let rootState;
  let nodes;
  let links;
  beforeEach(() => {
    dispatch = vi.fn();
    rootState = {};
    nodes = [];
    links = [];
    getAllNodes.mockReturnValue(nodes);
    getAllLinks.mockReturnValue(links);
    vi.useFakeTimers();
  });
  it("stores all colors", () => {
    clusterLoop({ dispatch, rootState });
    expect(dispatch).toHaveBeenCalledWith("storeColors");
  });
  it("calls getAllNodes", () => {
    clusterLoop({ dispatch, rootState });
    expect(getAllNodes).toHaveBeenCalledWith(rootState);
  });
  it("calls getAllLinks", () => {
    clusterLoop({ dispatch, rootState });
    expect(getAllLinks).toHaveBeenCalledWith(rootState);
  });
  it("clusters nodes", () => {
    clusterLoop({ dispatch, rootState });
    expect(dispatch).toHaveBeenCalledWith("clusterNodes");
  });
  it("rerenders graph", () => {
    clusterLoop({ dispatch, rootState });
    expect(dispatch).toHaveBeenCalledWith("rerenderGraph");
  });
  it("resets graph after it is finished", () => {
    clusterLoop({ dispatch, rootState });
    vi.advanceTimersByTime(8000);
    expect(dispatch).toHaveBeenCalledWith("loadColors");
  });
});

describe("fadeOut", () => {
  let dispatch;
  let rootState;
  let commit;
  let nodes;
  let links;
  beforeEach(() => {
    dispatch = vi.fn();
    commit = vi.fn();
    rootState = {};
    nodes = [{ id: "1" }, { id: "2" }, { id: "3" }];
    links = [];
    getAllNodes.mockReturnValue(nodes);
    getAllLinks.mockReturnValue(links);
    vi.useFakeTimers();
  });
  it("calls getAllNodes", () => {
    fadeOut({ commit, dispatch, rootState });
    expect(getAllNodes).toHaveBeenCalledWith(rootState);
  });
  it("calls getAllLinks", () => {
    fadeOut({ commit, dispatch, rootState });
    expect(getAllLinks).toHaveBeenCalledWith(rootState);
  });
  it("calls deletes nodes", () => {
    fadeOut({ commit, dispatch, rootState });
    vi.advanceTimersByTime(3);
    expect(commit).toHaveBeenCalledWith("REMOVE_NODE", nodes[2]);
  });
  it("calls deletes nodes for all nodes", () => {
    fadeOut({ commit, dispatch, rootState });
    vi.advanceTimersByTime(9);
    expect(commit).toHaveBeenCalledTimes(3);
  });
});
