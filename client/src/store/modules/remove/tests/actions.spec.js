import { actions } from "../actions";
global.expect = require("expect");

const { deleteGraph, deleteNodes } = actions;

describe("deleteGraph", () => {
  it("calls the clear graph mutation", () => {
    const commit = jest.fn();

    deleteGraph({
      commit,
    });
    expect(commit).toHaveBeenCalledWith("CLEAR_GRAPH");
  });
});
describe("deleteNodes", () => {
  it("calls the clear nodes with a certain label mutation", () => {
    const commit = jest.fn();

    deleteNodes(
      {
        commit,
      },
      "Artist",
    );
    expect(commit).toHaveBeenCalledWith("DELETE_NODES_FROM_GRAPH", {
      label: "Artist",
    });
  });
});
