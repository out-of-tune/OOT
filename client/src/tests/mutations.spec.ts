// @vitest-environment jsdom
import { mutations } from "../store/mutations";

const {
  SET_HOVERED_NODE,
  SET_GRAPHCONTAINER,
  CREATE_GRAPH,
  SET_RENDERER,
  ADD_TO_GRAPH,
  START_RENDERER,
  ADD_NODE_RULE,
  UPDATE_NODE_RULESET,
  DISPOSE_RENDERER,
} = mutations;

const getState = () => {
  return {
    mainGraph: {
      graphContainer: {},
      Graph: {},
      currentNode: {
        id: 0,
        data: {},
      },
      hoveredNode: {
        id: 0,
        data: {},
      },
      displayState: {
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
    queue: [],
    SearchQuery: "",
  };
};

describe("SET_HOVERED_NODE", () => {
  it("sets the node correctly", () => {
    const state = {
      mainGraph: {},
    };
    const node = {
      data: "test",
    };
    SET_HOVERED_NODE(state, node);
    expect(state.mainGraph.hoveredNode).toBe(node);
  });
});

describe("SET_GRAPHCONTAINER", () => {
  it("writes the given graphcontainer to the state", () => {
    const state = {
      mainGraph: {
        graphContainer: {},
      },
    };
    const container = {
      id: "graph-container",
    };
    SET_GRAPHCONTAINER(state, container);
    expect(state.mainGraph.graphContainer).toBe(container);
  });
});

describe("CREATE_GRAPH", () => {
  it("creates a graph object", () => {
    const state = {
      mainGraph: {
        Graph: null,
      },
    };
    CREATE_GRAPH(state);
    expect(state.mainGraph.Graph).toBeTruthy();
  });
});

describe("SET_RENDERER", () => {
  it("creates and sets the renderer", () => {
    const container = document.createElement("div");
    const state = {
      mainGraph: {
        Graph: null,
        graphContainer: container,
        renderState: {
          Renderer: null,
          layoutOptions: {
            springLength: 5,
            springCoeff: 0.00005,
            dragCoeff: 0.01,
            gravity: -10.2,
          },
        },
      },
    };
    CREATE_GRAPH(state);

    SET_RENDERER(state);

    const actual = state.mainGraph.renderState.Renderer;

    expect(actual).toBeTruthy();
  });
});

describe("ADD_TO_GRAPH", () => {
  it("adds all nodes to the graph", () => {
    const state = getState();
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
        },
      },
    ];
    CREATE_GRAPH(state);

    ADD_TO_GRAPH(state, {
      nodes,
    });

    const actual = state.mainGraph.Graph.getNodesCount();
    const expected = nodes.length;

    expect(actual).toBe(expected);
  });
  it("adds only links that are not already in the graph", () => {
    const state = getState();
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 2,
        toId: 3,
      },
      {
        fromId: 2,
        toId: 3,
      },
    ];

    const edges2 = [
      {
        fromId: 1,
        toId: 2,
      },
    ];

    const uniqueEdges = [
      {
        fromId: 1,
        toId: 2,
      },
      {
        fromId: 2,
        toId: 3,
      },
      {
        fromId: 1,
        toId: 3,
      },
    ];

    CREATE_GRAPH(state);

    ADD_TO_GRAPH(state, {
      links: edges2,
    });
    ADD_TO_GRAPH(state, {
      nodes,
      links: edges,
    });
    ADD_TO_GRAPH(state, {
      links: uniqueEdges,
    });

    // const actual = state.mainGraph.Graph.getLinksCount()

    const actualEdges = [];
    state.mainGraph.Graph.forEachLink((link) => {
      actualEdges.push(link);
    });

    const actual = actualEdges.length;
    const expected = uniqueEdges.length;

    expect(actual).toBe(expected);
  });
  it("adds an array of links to the link object when the link is in the graph", () => {
    const state = getState();
    const nodes = [
      {
        id: 1,
        data: {
          name: "bob",
        },
      },
      {
        id: 2,
        data: {
          name: "karl",
        },
      },
      {
        id: 3,
        data: {
          name: "franz",
        },
      },
    ];
    const edges = [
      {
        fromId: 1,
        toId: 2,
        linkName: "Eins",
      },
      {
        fromId: 2,
        toId: 3,
        linkName: "Eins",
      },
      {
        fromId: 2,
        toId: 3,
        linkName: "Zwei",
      },
    ];

    CREATE_GRAPH(state);

    ADD_TO_GRAPH(state, {
      nodes,
      links: edges,
    });

    const link = state.mainGraph.Graph.getLink(2, 3);

    const actual = link.linkTypes.length;
    const expected = 2;

    expect(actual).toBe(expected);
  });
});

describe("ADD_NODE_RULE", () => {
  let state;
  beforeEach(() => {
    state = {
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: [],
          },
        },
      },
    };
  });
  it("adds a color node rule", () => {
    const searchObject = {
      nodeType: "Auftrag",
      attributes: [],
    };
    const searchString = "Auftrag";
    const type = "color";

    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args: {
        color: "ffffffff",
      },
    });
    expect(
      state.configurations.appearanceConfiguration.nodeConfiguration.color,
    ).toStrictEqual([
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject,
            searchString,
            color: "ffffffff",
          },
        ],
      },
    ]);
  });
  it("adds a size node rule", () => {
    const searchObject = {
      nodeType: "Auftrag",
      attributes: [],
    };
    const searchString = "Auftrag";
    const type = "size";
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args: {
        size: 12,
      },
    });
    expect(
      state.configurations.appearanceConfiguration.nodeConfiguration.size,
    ).toStrictEqual([
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject,
            searchString,
            size: 12,
          },
        ],
      },
    ]);
  });
  it("adds a size mapped node rule", () => {
    const searchObject = {
      nodeType: "Auftrag",
      attributes: [
        { attributeSearch: "value", operator: "=", data: "irrelevant" },
      ],
    };
    const searchString = "Auftrag";
    const type = "size";
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args: {
        sizeType: "map",
        min: 10,
        max: 20,
      },
    });
    expect(
      state.configurations.appearanceConfiguration.nodeConfiguration.size,
    ).toStrictEqual([
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject,
            searchString,
            sizeType: "map",
            min: 10,
            max: 20,
          },
        ],
      },
    ]);
  });
  it("adds a color node rule when rules are already there", () => {
    state.configurations.appearanceConfiguration.nodeConfiguration.color = [
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [],
            },
            searchString: "Auftrag",
            color: "ffffffff",
          },
        ],
      },
    ];
    const searchObject = {
      nodeType: "Auftrag",
      attributes: [
        { attributeSearch: "name", operator: "=", attruteData: "N123" },
      ],
    };
    const searchString = "Auftrag: name=N123";
    const type = "color";
    ADD_NODE_RULE(state, {
      searchObject,
      searchString,
      type,
      args: {
        color: "abcdefaa",
      },
    });
    expect(
      state.configurations.appearanceConfiguration.nodeConfiguration.color,
    ).toStrictEqual([
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [],
            },
            searchString: "Auftrag",
            color: "ffffffff",
          },
          {
            searchObject,
            searchString,
            color: "abcdefaa",
          },
        ],
      },
    ]);
  });
});

describe("UPDATE_NODE_RULESET", () => {
  let state;
  beforeEach(() => {
    state = {
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: [],
          },
        },
      },
    };
  });
  it("updates node color ruleset", () => {
    state.configurations.appearanceConfiguration.nodeConfiguration.color = [
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [
                { attributeSearch: "name", operator: "=", attruteData: "N123" },
              ],
            },
            searchString: "Auftrag: name=N123",
            color: "ffffffff",
          },
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [],
            },
            searchString: "Auftrag",
            color: "abcdefaa",
          },
        ],
      },
    ];
    const rules = [
      {
        searchObject: {
          nodeType: "Auftrag",
          attributes: [
            { attributeSearch: "name", operator: "=", attruteData: "N1234" },
          ],
        },
        searchString: "Auftrag: name=N1234",
        color: "ffffffff",
      },
    ];
    const type = "color";
    const nodeLabel = "Auftrag";
    UPDATE_NODE_RULESET(state, {
      rules,
      nodeLabel,
      type,
    });
    expect(
      state.configurations.appearanceConfiguration.nodeConfiguration.color,
    ).toEqual([
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [
                { attributeSearch: "name", operator: "=", attruteData: "N123" },
              ],
            },
            searchString: "Auftrag: name=N123",
            color: "ffffffff",
          },
          {
            searchObject: {
              nodeType: "Auftrag",
              attributes: [
                {
                  attributeSearch: "name",
                  operator: "=",
                  attruteData: "N1234",
                },
              ],
            },
            searchString: "Auftrag: name=N1234",
            color: "ffffffff",
          },
        ],
      },
    ]);
  });
});

describe("DISPOSE_RENDERER", () => {
  it("disposes the renderer and forgets it", () => {
    const dispose = vi.fn();
    const state = {
      mainGraph: { renderState: { Renderer: { dispose }, layout: {} } },
    };
    DISPOSE_RENDERER(state);
    expect(dispose).toHaveBeenCalled();
    expect(state.mainGraph.renderState.Renderer).toBeNull();
    expect(state.mainGraph.renderState.layout).toBeUndefined();
  });

  it("does nothing without a renderer, as during the first 3D load", () => {
    const state = { mainGraph: { renderState: { Renderer: null } } };
    expect(() => DISPOSE_RENDERER(state)).not.toThrow();
  });
});
