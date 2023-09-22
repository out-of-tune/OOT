import { mutations } from "../mutations";
global.expect = require("expect");
const { SET_CONFIGURATION_URL, SET_STORED_CONFIGURATION_NAMES } = mutations;

describe("SET_CONFIGURATION_URL", () => {
  let state;
  beforeEach(() => {
    state = {
      url: 0,
    };
  });
  it("sets url in state", () => {
    SET_CONFIGURATION_URL(state, "url");
    expect(state.url).toBe("url");
  });
});

describe("SET_STORED_CONFIGURATION_NAMES", () => {
  let state;
  beforeEach(() => {
    state = {
      storedConfigurationNames: {},
    };
  });
  it("sets configurationNames in state", () => {
    SET_STORED_CONFIGURATION_NAMES(state, "storedConfiguration");
    expect(state.storedConfigurationNames).toEqual("storedConfiguration");
  });
});
