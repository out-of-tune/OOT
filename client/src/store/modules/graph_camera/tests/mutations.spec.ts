import { mutations } from "../mutations";

const { SET_NODE_LABELS } = mutations;

describe("SET_NODE_LABELS", () => {
  let state;
  beforeEach(() => {
    state = {
      nodeLabels: [{ id: "WOOB" }],
    };
  });
  it("sets the stored graph names", () => {
    SET_NODE_LABELS(state, { NOOB: { id: "NOOB" } });
    expect(state.nodeLabels).toEqual({ NOOB: { id: "NOOB" } });
  });
});
