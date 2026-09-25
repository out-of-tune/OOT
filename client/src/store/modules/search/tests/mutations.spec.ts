import { mutations } from "../mutations";
const { SET_ADVANCED_OPEN } = mutations;

describe("SET_ADVANCED_OPEN", () => {
  let state;
  beforeEach(() => {
    state = {
      advancedOpen: false,
    };
  });
  it("sets the selected nodes", () => {
    SET_ADVANCED_OPEN(state, true);
    expect(state.advancedOpen).toEqual(true);
  });
});
