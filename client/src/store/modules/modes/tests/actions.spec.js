import { actions } from "../actions";
global.expect = require("expect");
global._ = require("lodash");
const { updateGraphModificationConfiguration, setActiveMode } = actions;

describe("updateGraphModificationConfiguration", () => {
  let commit;
  let selectedOptions;
  beforeEach(() => {
    commit = jest.fn();
    selectedOptions = [
      {
        edgeLabel: "Soup",
        nodeLabel: "abc",
      },
      {
        edgeLabel: "Stew",
        nodeLabel: "abc",
      },
    ];
  });
  it("updates expand configuration", () => {
    updateGraphModificationConfiguration(
      { commit },
      { actionType: "expand", selectedOptions, nodeType: "abc" },
    );
    const expected = ["Soup", "Stew"];
    expect(commit).toHaveBeenCalledWith("UPDATE_EXPAND_CONFIGURATION", {
      nodeType: "abc",
      edges: expected,
    });
  });
  it("updates collapse configuration", () => {
    updateGraphModificationConfiguration(
      { commit },
      { actionType: "collapse", selectedOptions, nodeType: "abc" },
    );
    const expected = ["Soup", "Stew"];
    expect(commit).toHaveBeenCalledWith("UPDATE_COLLAPSE_CONFIGURATION", {
      nodeType: "abc",
      edges: expected,
    });
  });
});
describe("setActiveMode", () => {
  it("sets the active mode", () => {
    const commit = jest.fn();
    const activeMode = "expand";
    setActiveMode(
      {
        commit,
      },
      activeMode,
    );
    expect(commit).toHaveBeenCalledWith("SET_ACTIVE_MODE", activeMode);
  });
});
