import { actions } from "../actions";
import Viva from "vivagraphjs";
global._ = require("lodash");

import { getAllNodes } from "@/assets/js/graphHelper";
vi.mock("@/assets/js/graphHelper");
const { setError, setInfo, setSuccess, setMessage, setSnackColor } = actions;

describe("setError", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("sets the snackbar color to error", () => {
    setError({ dispatch }, { message: "123" });
    expect(dispatch).toHaveBeenCalledWith("setSnackColor", "error");
  });
  it("sets the snackbar message", () => {
    setError({ dispatch }, { message: "123" });
    expect(dispatch).toHaveBeenCalledWith("setMessage", "123");
  });
});

describe("setInfo", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("sets the snackbar color to info", () => {
    setInfo({ dispatch }, { message: "123" });
    expect(dispatch).toHaveBeenCalledWith("setSnackColor", "info");
  });
  it("sets the snackbar message", () => {
    setInfo({ dispatch }, "123");
    expect(dispatch).toHaveBeenCalledWith("setMessage", "123");
  });
});

describe("setSuccess", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("sets the snackbar color to success", () => {
    setSuccess({ dispatch }, { message: "123" });
    expect(dispatch).toHaveBeenCalledWith("setSnackColor", "success");
  });
  it("sets the snackbar message", () => {
    setSuccess({ dispatch }, "123");
    expect(dispatch).toHaveBeenCalledWith("setMessage", "123");
  });
});

describe("setMessage", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("sets the snackbar color to error", () => {
    setMessage({ commit }, "123");
    expect(commit).toHaveBeenCalledWith("SET_MESSAGE", "123");
  });
});

describe("setMessage", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("sets the snackbar color to error", () => {
    setSnackColor({ commit }, "error");
    expect(commit).toHaveBeenCalledWith("SET_SNACK_COLOR", "error");
  });
});
