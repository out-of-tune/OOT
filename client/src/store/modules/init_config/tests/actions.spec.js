import actions from "../actions";

const { initConfiguration } = actions;
describe("initConfiguration", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      schema: {
        nodeTypes: [],
        edgeTypes: [],
      },
    };
  });
  it("calls SET_COFIGURATION", () => {
    initConfiguration({
      commit,
      rootState,
    });

    expect(commit).toHaveBeenCalledWith("SET_CONFIGURATION", expect.anything());
  });
});
