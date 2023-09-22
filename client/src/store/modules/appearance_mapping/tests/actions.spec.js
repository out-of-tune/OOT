import { actions } from "../actions";
global.expect = require("expect");
import Viva from "vivagraphjs";
import searchObjectHelper from "@/assets/js/searchObjectHelper";
jest.mock("@/assets/js/searchObjectHelper");
import {
  getNodesByLabel,
  getNodeColor,
  searchGraph,
  getAllNodes,
} from "@/assets/js/graphHelper";
jest.mock("@/assets/js/graphHelper");

const {
  setNodeColorDefault,
  setNodeColorRule,
  applyNodeColorConfiguration,
  applyNodeSizeConfiguration,
  setNodeSizeDefault,
  setNodeSizeRule,
  setNodeSizeMapped,
  addRule,
  updateRuleset,
  applyEdgeColorConfiguration,
  updateEdgeRules,
  updateTooltipRules,
  applyNodeConfiguration,
  setConfiguratedEdgeColor,
  markClickedNodes,
} = actions;

describe("setNodeColorDefault", () => {
  let commit;
  let nodes;
  beforeEach(() => {
    nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "Auftrag",
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
          label: "Auftrag",
        },
      },
    ];
    commit = jest.fn();
  });
  it("sets nodes to default color", () => {
    setNodeColorDefault(
      {
        commit,
      },
      nodes,
    );
    expect(commit).toHaveBeenNthCalledWith(1, "SET_NODE_COLOR", {
      node: 1,
      color: parseInt("009ee8ff", 16),
    });
    expect(commit).toHaveBeenNthCalledWith(2, "SET_NODE_COLOR", {
      node: 2,
      color: parseInt("009ee8ff", 16),
    });
    expect(commit).toHaveBeenNthCalledWith(3, "SET_NODE_COLOR", {
      node: 3,
      color: parseInt("009ee8ff", 16),
    });
  });
});

describe("setNodeColorRule", () => {
  let dispatch;
  let commit;
  let rule;
  let selectedNodes;
  let rootState;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    rootState = {
      mainGraph: {
        Graph: {},
      },
    };
    rule = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag",
      color: "ffffffff",
    };
    selectedNodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "Auftrag",
        },
        links: [],
      },
    ];
    searchGraph.mockReturnValue(selectedNodes);
  });
  it("commits SET_NODE_COLOR for selectedNodes", () => {
    setNodeColorRule({ commit, rootState, dispatch }, { rule });
    expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR", {
      node: selectedNodes[0].id,
      color: parseInt("ffffffff", 16),
    });
  });
});

describe("setNodeSizeRule", () => {
  let dispatch;
  let commit;
  let rule;
  let nodes;
  let rootState;
  let selectedNodes;
  beforeEach(() => {
    dispatch = jest.fn();
    commit = jest.fn();
    rootState = {
      mainGraph: {
        Graph: {},
      },
    };
    rule = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag",
      size: 20,
      sizeType: "compare",
    };
    selectedNodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "Auftrag",
        },
        links: [],
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "Auftrag",
        },
        links: [],
      },
    ];
    getNodesByLabel.mockReturnValue(selectedNodes);
  });
  it("dispatches setNodeSizeMapped when sizeType is map", () => {
    rule.sizeType = "map";
    rule.min = 10;
    rule.max = 50;

    setNodeSizeRule({ commit, rootState, dispatch }, { rule, nodes });

    expect(dispatch).toHaveBeenCalledWith("setNodeSizeMapped", {
      nodes: selectedNodes,
      attribute: "name",
      minMapValue: 10,
      maxMapValue: 50,
    });
  });
  it("commits SET_NODE_SIZE when sizeType is compare", () => {
    let selectedNodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "Auftrag",
        },
        links: [],
      },
    ];
    setNodeSizeRule({ commit, rootState, dispatch }, { rule });
    expect(commit).toHaveBeenCalledWith("SET_NODE_SIZE", {
      node: selectedNodes[0].id,
      size: 20,
    });
  });
});

describe("applyNodeConfiguration", () => {
  let rootState;
  let dispatch;
  let configuration;
  let ruleAction;
  let defaultAction;
  let nodes;
  beforeEach(() => {
    ruleAction = "setNodeColorRule";
    defaultAction = "setNodeColorDefault";
    rootState = {
      mainGraph: {
        Graph: {},
      },
    };
    nodes = [
      {
        id: 1,
        data: {
          name: "bob",
          label: "Auftrag",
        },
        links: [],
      },
      {
        id: 2,
        data: {
          name: "karl",
          label: "cde",
        },
        links: [],
      },
      {
        id: 3,
        data: {
          name: "franz",
          label: "Auftrag",
        },
        links: [],
      },
    ];
    dispatch = jest.fn();
    getAllNodes.mockReturnValue(nodes);
  });

  it("dispatches ruleAction when configurations and rules are not empty", () => {
    configuration = [
      {
        nodeLabel: "Auftrag",
        rules: [
          {
            searchObject: {
              valid: true,
              errors: [],
              nodeType: "Auftrag",
              attributes: [
                {
                  attributeSearch: "name",
                  attributeData: "bob",
                  operator: "=",
                },
              ],
            },
            searchString: "Auftrag",
            color: "ffffffff",
          },
        ],
      },
    ];
    applyNodeConfiguration(
      {
        rootState,
        dispatch,
      },
      {
        configuration,
        ruleAction,
        defaultAction,
      },
    );
    expect(dispatch).toHaveBeenCalledWith("setNodeColorRule", {
      nodes: [nodes[0], nodes[2]],
      rule: {
        color: "ffffffff",
        searchObject: {
          valid: true,
          errors: [],
          nodeType: "Auftrag",
          attributes: [
            {
              attributeSearch: "name",
              attributeData: "bob",
              operator: "=",
            },
          ],
        },
        searchString: "Auftrag",
      },
    });
  });
  it("dispatches default action when rules are empty", () => {
    configuration = [
      {
        nodeLabel: "Auftrag",
        rules: [],
      },
    ];
    applyNodeConfiguration(
      { dispatch, rootState },
      {
        configuration,
        ruleAction,
        defaultAction,
      },
    );
    expect(dispatch).toHaveBeenCalledWith("setNodeColorDefault", [
      nodes[0],
      nodes[2],
    ]);
  });
});

describe("applyNodeColorConfiguration", () => {
  let rootState;
  let dispatch;
  beforeEach(() => {
    rootState = {
      appearance: {
        highlight: false,
      },
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [
              {
                nodeLabel: "Auftrag",
                rules: [
                  {
                    searchObject: {
                      valid: true,
                      errors: [],
                      nodeType: "Auftrag",
                      attributes: [
                        {
                          attributeSearch: "name",
                          attributeData: "bob",
                          operator: "=",
                        },
                      ],
                    },
                    searchString: "Auftrag",
                    color: "ffffffff",
                  },
                ],
              },
            ],
          },
        },
      },
    };
    dispatch = jest.fn();
  });
  it("calls applyNodeConfiguration with correct configuration and arguments", () => {
    applyNodeColorConfiguration({
      rootState,
      dispatch,
    });
    expect(dispatch).toHaveBeenCalledWith("applyNodeConfiguration", {
      configuration: [
        {
          nodeLabel: "Auftrag",
          rules: [
            {
              searchObject: {
                valid: true,
                errors: [],
                nodeType: "Auftrag",
                attributes: [
                  {
                    attributeSearch: "name",
                    attributeData: "bob",
                    operator: "=",
                  },
                ],
              },
              searchString: "Auftrag",
              color: "ffffffff",
            },
          ],
        },
      ],
      ruleAction: "setNodeColorRule",
      defaultAction: "setNodeColorDefault",
      nodes: [],
    });
  });
});

describe("applyNodeSizeConfiguration", () => {
  let rootState;
  let dispatch;
  beforeEach(() => {
    rootState = {
      configurations: {
        appearanceConfiguration: {
          nodeConfiguration: {
            size: [
              {
                nodeLabel: "Auftrag",
                rules: [
                  {
                    searchObject: {
                      valid: true,
                      errors: [],
                      nodeType: "Auftrag",
                      attributes: [
                        {
                          attributeSearch: "name",
                          attributeData: "bob",
                          operator: "=",
                        },
                      ],
                    },
                    searchString: "Auftrag",
                    size: 20,
                  },
                ],
              },
            ],
          },
        },
      },
    };
    dispatch = jest.fn();
  });
  it("calls applyNodeConfiguration with correct configuration and arguments", () => {
    applyNodeSizeConfiguration({
      rootState,
      dispatch,
    });
    expect(dispatch).toHaveBeenCalledWith("applyNodeConfiguration", {
      configuration: [
        {
          nodeLabel: "Auftrag",
          rules: [
            {
              searchObject: {
                valid: true,
                errors: [],
                nodeType: "Auftrag",
                attributes: [
                  {
                    attributeSearch: "name",
                    attributeData: "bob",
                    operator: "=",
                  },
                ],
              },
              searchString: "Auftrag",
              size: 20,
            },
          ],
        },
      ],
      ruleAction: "setNodeSizeRule",
      defaultAction: "setNodeSizeDefault",
      nodes: [],
    });
  });
});

describe("setNodeSizeMapped", () => {
  let commit;
  beforeEach(() => {
    commit = jest.fn();
  });
  it("maps the nodes and calls SET_NODE_SIZE", () => {
    const nodes = [
      {
        id: "Werk/1",
        data: {
          Location: "Wien",
          size: "M",
          population: 10,
        },
      },
      {
        id: "Werk/2",
        data: {
          Location: "Wien",
          size: "M",
          population: 0,
        },
      },
      {
        id: "Werk/3",
        data: {
          Location: "Graz",
          size: "L",
          population: 1000,
        },
      },
      {
        id: "Werk/4",
        data: {
          Location: "Graz",
          size: "XL",
          population: 100,
        },
      },
    ];
    setNodeSizeMapped(
      {
        commit,
      },
      {
        nodes,
        attribute: "population",
        minMapValue: 0,
        maxMapValue: 100,
      },
    );
    expect(commit).toHaveBeenNthCalledWith(1, "SET_NODE_SIZE", {
      node: "Werk/1",
      size: 1,
    });
    expect(commit).toHaveBeenNthCalledWith(2, "SET_NODE_SIZE", {
      node: "Werk/2",
      size: 0,
    });
    expect(commit).toHaveBeenNthCalledWith(3, "SET_NODE_SIZE", {
      node: "Werk/3",
      size: 100,
    });
    expect(commit).toHaveBeenNthCalledWith(4, "SET_NODE_SIZE", {
      node: "Werk/4",
      size: 10,
    });
  });
  it("doesn't map node when all attributes are same", () => {
    const nodesOfType = [
      {
        id: "Werk/1",
        data: {
          Location: "Wien",
          size: "M",
          population: 10,
        },
      },
    ];
    setNodeSizeMapped(
      {
        commit,
      },
      {
        nodes: nodesOfType,
        attribute: "population",
        minMapValue: 0,
        maxMapValue: 100,
      },
    );
    expect(commit).not.toHaveBeenCalled();
  });
});

describe("addRule", () => {
  let commit;
  let type;
  let rootState;
  let dispatch;
  let validateSearchObject;
  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    searchObjectHelper.validateSearchObject.mockReturnValue(true);
  });
  it("adds a valid color rule", () => {
    rootState = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag: name=bob",
    };
    type = "color";
    let color = "ffffffff";
    addRule(
      { commit, rootState, dispatch },
      {
        type,
        searchObject: rootState.searchObject,
        searchString: rootState.searchString,
        color,
      },
    );
    expect(commit).toHaveBeenCalledWith("ADD_NODE_RULE", {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag: name=bob",
      type: "color",
      args: { color: "ffffffff" },
    });
  });
  it("doesn't add an invalid rule", () => {
    rootState = {
      searchObject: {
        valid: false,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: undefined,
            attributeData: undefined,
            operator: undefined,
          },
        ],
      },
      searchString: "Auftrag name=bob",
    };
    type = "color";
    let color = "ffffffff";
    addRule(
      { commit, rootState, dispatch },
      {
        type,
        searchObject: rootState.searchObject,
        searchString: rootState.searchString,
        color,
      },
    );
    expect(commit).not.toHaveBeenCalled();
  });
  it("adds a valid size map rule", () => {
    rootState = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag: name=bob",
    };
    type = "size";
    let size = 12;
    addRule(
      { commit, rootState, dispatch },
      {
        type,
        searchObject: rootState.searchObject,
        searchString: rootState.searchString,
        sizeType: "map",
      },
    );
    expect(commit).toHaveBeenCalledWith("ADD_NODE_RULE", {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag: name=bob",
      type: "size",
      args: { sizeType: "map" },
    });
  });
  it("errors when no attribute is given while adding a map rule", () => {
    rootState = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [],
      },
      searchString: "Auftrag: name=bob",
    };
    type = "size";
    let size = 12;
    addRule(
      { commit, rootState, dispatch },
      {
        type,
        searchObject: rootState.searchObject,
        searchString: rootState.searchString,
        sizeType: "map",
      },
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("An attribute has to be chosen to add a map rule"),
    );
  });
  it("doesn't add rule for nonexisting schema", () => {
    searchObjectHelper.validateSearchObject.mockReturnValueOnce(false);
    rootState = {
      searchObject: {
        valid: true,
        errors: [],
        nodeType: "Auftrag",
        attributes: [
          {
            attributeSearch: "name",
            attributeData: "bob",
            operator: "=",
          },
        ],
      },
      searchString: "Auftrag: name=bob",
    };
    type = "size";
    addRule(
      { commit, rootState, dispatch },
      {
        type,
        searchObject: rootState.searchObject,
        searchString: rootState.searchString,
        sizeType: "map",
      },
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("search parameters not in schema"),
    );
  });
});

describe("applyEdgeColorConfiguration", () => {
  let rootState;
  let commit;
  let links;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      appearance: {
        highlight: false,
      },
      mainGraph: {
        Graph: new Viva.Graph.graph(),
      },
      configurations: {
        appearanceConfiguration: {
          edgeConfiguration: {
            color: [
              {
                edgeLabel: "a",
                color: "00ffffff",
              },
              {
                edgeLabel: "b",
                color: "00ffffff",
              },
              {
                edgeLabel: "c",
                color: "00fffff1",
              },
            ],
          },
        },
      },
    };
    links = [
      {
        fromId: "a1",
        toId: "a2",
        id: "a1👉 a2",
        linkTypes: ["a"],
      },
      {
        fromId: "b1",
        toId: "b2",
        id: "b1👉 b2",
        linkTypes: ["b"],
      },
      {
        fromId: "c1",
        toId: "c2",
        id: "c1👉 c2",
        linkTypes: ["c", "a"],
      },
    ];
    links.forEach((link) => {
      let graphLink = rootState.mainGraph.Graph.addLink(link.fromId, link.toId);
      graphLink.linkTypes = link.linkTypes;
    });
  });
  it("commits SET_EDGE_COLOR for all links", () => {
    applyEdgeColorConfiguration({ rootState, commit });
    let expectedColors = ["00ffffff", "00ffffff", "00fffff8"];
    expect(commit).toHaveBeenNthCalledWith(1, "SET_EDGE_COLOR", {
      link: links[0],
      color: parseInt(expectedColors[0], 16),
    });
    expect(commit).toHaveBeenNthCalledWith(2, "SET_EDGE_COLOR", {
      link: links[1],
      color: parseInt(expectedColors[1], 16),
    });
    expect(commit).toHaveBeenNthCalledWith(3, "SET_EDGE_COLOR", {
      link: links[2],
      color: parseInt(expectedColors[2], 16),
    });
  });
});

describe("setConfiguratedEdgeColor", () => {
  let rootState;
  let commit;
  let links;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      mainGraph: {
        Graph: new Viva.Graph.graph(),
      },
      configurations: {
        appearanceConfiguration: {
          edgeConfiguration: {
            color: [
              {
                edgeLabel: "a",
                color: "00ffffff",
              },
              {
                edgeLabel: "b",
                color: "00ffffff",
              },
              {
                edgeLabel: "c",
                color: "00fffff1",
              },
            ],
          },
        },
      },
    };
    links = [
      {
        fromId: "a1",
        toId: "a2",
        id: "a1👉 a2",
        linkTypes: ["a"],
      },
      {
        fromId: "b1",
        toId: "b2",
        id: "b1👉 b2",
        linkTypes: ["b"],
      },
      {
        fromId: "c1",
        toId: "c2",
        id: "c1👉 c2",
        linkTypes: ["c", "a"],
      },
    ];
    links.forEach((link) => {
      let graphLink = rootState.mainGraph.Graph.addLink(link.fromId, link.toId);
      graphLink.linkTypes = link.linkTypes;
    });
  });
  it("commits SET_EDGE_COLOR for all links", () => {
    setConfiguratedEdgeColor(
      { rootState, commit },
      {
        fromId: "a1",
        toId: "a2",
        id: "a1👉 a2",
        linkTypes: ["a"],
      },
    );
    let expectedColor = "00ffffff";
    expect(commit).toHaveBeenNthCalledWith(1, "SET_EDGE_COLOR", {
      link: links[0],
      color: parseInt(expectedColor, 16),
    });
  });
});

describe("markClickedNodes", () => {
  let rootState;
  let commit;
  beforeEach(() => {
    commit = jest.fn();
    rootState = {
      history: {
        clickHistory: {
          1: { data: "someData" },
          2: { data: "someData" },
        },
      },
      mainGraph: {
        Graph: {
          getNode: jest.fn(),
        },
      },
    };
    rootState.mainGraph.Graph.getNode.mockReturnValue(true);
  });
  it("sets the node color", () => {
    markClickedNodes({ rootState, commit });
    expect(commit).toHaveBeenCalledWith("SET_NODE_COLOR", {
      node: "1",
      color: parseInt("eeeeeeff", 16),
    });
  });
  it("checks if the node is in the graph", () => {
    markClickedNodes({ rootState, commit });
    expect(rootState.mainGraph.Graph.getNode).toHaveBeenCalledWith("1");
  });
  it("marks every node in the history", () => {
    markClickedNodes({ rootState, commit });
    expect(commit).toHaveBeenCalledTimes(2);
  });
});

describe("updateRuleset", () => {
  let commit;
  let ruleset;
  let type;
  let nodeLabel;
  beforeEach(() => {
    commit = jest.fn();
    ruleset = "a ruleset";
    type = "type";
    nodeLabel = "genre";
  });
  it("updates node ruleset", () => {
    updateRuleset({ commit }, { ruleset, type, nodeLabel });
    expect(commit).toHaveBeenCalledWith("UPDATE_NODE_RULESET", {
      rules: ruleset,
      nodeLabel,
      type,
    });
  });
});

describe("updateEdgeRules", () => {
  let commit;
  let rules;
  beforeEach(() => {
    commit = jest.fn();
    rules = "a rule";
  });
  it("updates node ruleset", () => {
    updateEdgeRules({ commit }, { rules });
    expect(commit).toHaveBeenCalledWith("UPDATE_EDGE_RULES", { rules });
  });
});

describe("updateTooltipRules", () => {
  let commit;
  let rules;
  beforeEach(() => {
    commit = jest.fn();
    rules = "a rule";
  });
  it("updates edge ruleset", () => {
    updateTooltipRules({ commit }, { rules });
    expect(commit).toHaveBeenCalledWith("UPDATE_TOOLTIP_RULES", { rules });
  });
});
