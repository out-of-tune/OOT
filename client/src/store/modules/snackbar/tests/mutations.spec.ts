import { mutations } from "../mutations";
const { SET_MESSAGE, SET_SNACK_COLOR } = mutations;

describe("SET_MESSAGE", () => {
  let state;
  beforeEach(() => {
    state = {
      message: "",
    };
  });
  it("sets the message", () => {
    SET_MESSAGE(state, "123");
    expect(state.message).toEqual("123");
  });
});

describe("SET_SNACK_COLOR", () => {
  let state;
  beforeEach(() => {
    state = {
      color: "",
    };
  });
  it("sets the message", () => {
    SET_SNACK_COLOR(state, "error");
    expect(state.color).toEqual("error");
  });
});
