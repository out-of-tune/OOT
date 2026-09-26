import { actions } from "../actions";

const { deleteGraph } = actions;

describe("deleteGraph", () => {
  it("calls the clear graph mutation", () => {
    const commit = vi.fn();

    deleteGraph({
      commit,
    });
    expect(commit).toHaveBeenCalledWith("CLEAR_GRAPH");
  });
});
