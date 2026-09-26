import { actions } from "../actions";
import Viva from "vivagraphjs";

const { collapseAction } = actions;

describe("collapseAction", () => {
  it("removes all connections as specified in configuration", () => {
    const commit = vi.fn();
    const dispatch = vi.fn();

    const collapseOptions = [
      {
        nodeType: "abc",
        edges: ["Soup"],
      },
      {
        nodeType: "cde",
        edges: ["Soup"],
      },
      {
        nodeType: "efg",
        edges: ["Stew"],
      },
    ];
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {},
        },
        hoveredNode: {
          id: 0,
          data: {},
        },
        displayState: {
          displayEdges: true,
          showTooltip: false,
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2,
          },
        },
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions,
        },
      },
    };
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 1,
        toId: 3,
      },
      {
        fromId: 2,
        toId: 3,
      },
    ];
    const graph = rootState.mainGraph.Graph;
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    });
    const linksErg = [];
    edges.forEach((edge) => {
      const lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"];
      linksErg.push(lonk);
    });

    collapseAction(
      {
        commit,
        rootState,
        dispatch,
      },
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
    );
    expect(commit).toHaveBeenNthCalledWith(1, "REMOVE_LINK", linksErg[0]);
    expect(commit).toHaveBeenNthCalledWith(2, "REMOVE_LINK", linksErg[1]);
  });
  it("removes formerly connected Nodes if they have no connection left", () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const collapseOptions = [
      {
        nodeType: "abc",
        edges: ["Soup"],
      },
      {
        nodeType: "cde",
        edges: ["Soup"],
      },
      {
        nodeType: "efg",
        edges: ["Stew"],
      },
    ];
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {},
        },
        hoveredNode: {
          id: 0,
          data: {},
        },
        displayState: {
          displayEdges: true,
          showTooltip: false,
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2,
          },
        },
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions,
        },
      },
    };
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 1,
        toId: 3,
      },
    ];
    const graph = rootState.mainGraph.Graph;
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    });
    const linksErg = [];
    edges.forEach((edge) => {
      const lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"];
      linksErg.push(lonk);
    });

    collapseAction(
      {
        commit,
        rootState,
        dispatch,
      },
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
    );
    expect(commit).toHaveBeenNthCalledWith(3, "REMOVE_NODE", {
      data: {
        label: "cde",
        name: "karl",
      },
      id: 2,
      links: [
        {
          data: undefined,
          fromId: 1,
          id: "1👉 2",
          linkTypes: ["Soup"],
          toId: 2,
        },
      ],
    });
    expect(commit).toHaveBeenNthCalledWith(4, "REMOVE_NODE", {
      data: {
        label: "cde",
        name: "franz",
      },
      id: 3,
      links: [
        {
          data: undefined,
          fromId: 1,
          id: "1👉 3",
          linkTypes: ["Soup"],
          toId: 3,
        },
      ],
    });
  });
  it("doesn't removes formerly connected Nodes if they have a connection left", () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const collapseOptions = [
      {
        nodeType: "abc",
        edges: ["Soup"],
      },
      {
        nodeType: "cde",
        edges: ["Soup"],
      },
      {
        nodeType: "efg",
        edges: ["Stew"],
      },
    ];
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {},
        },
        hoveredNode: {
          id: 0,
          data: {},
        },
        displayState: {
          displayEdges: true,
          showTooltip: false,
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2,
          },
        },
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions,
        },
      },
    };
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 1,
        toId: 3,
      },
      {
        fromId: 2,
        toId: 3,
      },
    ];
    const graph = rootState.mainGraph.Graph;
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    });
    const linksErg = [];
    edges.forEach((edge) => {
      const lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"];
      linksErg.push(lonk);
    });

    collapseAction(
      {
        commit,
        rootState,
        dispatch,
      },
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
    );
    expect(commit).toHaveBeenLastCalledWith("REMOVE_LINK", linksErg[1]);
  });
  it("removes nothing if configuration is set correspondingly", () => {
    const commit = vi.fn();
    const dispatch = vi.fn();
    const collapseOptions = [];
    const rootState = {
      mainGraph: {
        graphContainer: {},
        Graph: Viva.Graph.graph(),
        currentNode: {
          id: 0,
          data: {},
        },
        hoveredNode: {
          id: 0,
          data: {},
        },
        displayState: {
          displayEdges: true,
          showTooltip: false,
        },
        renderState: {
          Renderer: null,
          isRendered: true,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2,
          },
        },
      },
      configurations: {
        actionConfiguration: {
          collapse: collapseOptions,
        },
      },
    };
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "cde",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 1,
        toId: 3,
      },
      {
        fromId: 2,
        toId: 3,
      },
    ];
    const graph = rootState.mainGraph.Graph;
    nodes.forEach((node) => {
      graph.addNode(node.id, node.data);
    });
    const linksErg = [];
    edges.forEach((edge) => {
      const lonk = graph.addLink(edge.fromId, edge.toId);
      lonk.linkTypes = ["Soup"];
      linksErg.push(lonk);
    });

    collapseAction(
      {
        commit,
        rootState,
        dispatch,
      },
      {
        id: 1,
        data: {
          name: "bob",
          label: "abc",
        },
      },
    );
    expect(commit).toHaveBeenNthCalledWith(
      1,
      "UPDATE_LINKTYPES",
      expect.anything(),
    );
    expect(commit).toHaveBeenNthCalledWith(
      2,
      "UPDATE_LINKTYPES",
      expect.anything(),
    );
  });
});

describe("collapse history", () => {
  it("records the removed edge types of a link that stays", () => {
    const Graph = Viva.Graph.graph();
    Graph.addNode(1, { label: "abc" });
    Graph.addNode(2, { label: "cde" });
    Graph.addLink(1, 2).linkTypes = ["Soup", "Stew"];
    const rootState = {
      mainGraph: { Graph },
      configurations: {
        actionConfiguration: {
          collapse: [{ nodeType: "abc", edges: ["Soup"] }],
        },
      },
    };
    const commit = vi.fn();
    const dispatch = vi.fn();
    collapseAction(
      { commit, rootState, dispatch } as never,
      {
        id: 1,
        data: { label: "abc" },
      } as never,
    );

    expect(commit).toHaveBeenCalledWith(
      "UPDATE_LINKTYPES",
      expect.objectContaining({ linkTypes: ["Stew"] }),
    );
    // Redo removes these types again and undo adds them back, so the link keeps "Stew".
    const change = dispatch.mock.calls[0][1];
    expect(change.data.links).toEqual([
      expect.objectContaining({ fromId: 1, toId: 2, linkTypes: ["Soup"] }),
    ]);
  });
});
