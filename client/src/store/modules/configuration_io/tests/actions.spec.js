/**
 * @jest-environment jsdom
 */

import { actions } from "../actions";
import IndexedDbService from "@/store/services/IndexedDbService";
vi.mock("@/store/services/IndexedDbService");

const {
  importConfiguration,
  downloadConfiguration,
  storeConfiguration,
  loadConfigurationFromIndexedDb,
  loadConfiguration,
  removeConfigurationFromIndexedDb,
} = actions;

describe("importConfiguration", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("verifies a correct schema", () => {
    const js = require("./schema.json");
    const testString = js;

    importConfiguration(
      {
        dispatch,
      },
      JSON.stringify(testString),
    );
    expect(dispatch).toHaveBeenCalledWith("loadConfiguration", testString);
  });
  it("doesn't load a json file with wrong data", () => {
    const testString = '{"whoami":"wrong data"}';
    importConfiguration(
      {
        dispatch,
      },
      testString,
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("error at instance\nerror at instance"),
    );
  });
  it("Only loads JSON files", () => {
    const testString = "<tag>I am not a JSON, just a mere XML</tag>";
    importConfiguration(
      {
        dispatch,
      },
      testString,
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new SyntaxError(
        "Unexpected token '<', \"<tag>I am \"... is not valid JSON",
      ),
    );
  });
});

describe("storeConfiguration", () => {
  let commit;
  let rootState;
  let state;
  let dispatch;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    rootState = {
      configuration_io: {
        storedConfigurationNames: ["MamboNo1Config"],
      },
      configurations: {
        name: "dummyObject",
      },
    };
    state = rootState.configuration_io;
  });
  it("calls saveIndexedDb", () => {
    storeConfiguration({ rootState, dispatch, commit, state }, "abc");
    expect(IndexedDbService.saveConfiguration).toHaveBeenCalledWith(
      "abc",
      rootState.configurations,
    );
  });
  it("adds name to stored configuration name list if it is not there yet", () => {
    storeConfiguration({ rootState, dispatch, commit, state }, "abc");
    expect(commit).toHaveBeenCalledWith("SET_STORED_CONFIGURATION_NAMES", [
      "MamboNo1Config",
      "abc",
    ]);
  });
  it("doesn't add name if string already exists", () => {
    storeConfiguration(
      { rootState, dispatch, commit, state },
      "MamboNo1Config",
    );
    expect(commit).toHaveBeenCalledWith("SET_STORED_CONFIGURATION_NAMES", [
      "MamboNo1Config",
    ]);
  });
  it("dispatches an error message when IndexedDb errors", () => {
    IndexedDbService.saveConfiguration.mockImplementationOnce(
      new Error("A error"),
    );
    storeConfiguration({ rootState, dispatch, commit, state }, "MamboNo1");
    expect(dispatch).toHaveBeenCalledWith("setError", expect.anything());
  });
});
describe("loadConfigurationFromIndexedDb", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("calls indexedDbWith correct name", async () => {
    IndexedDbService.getConfiguration = vi.fn();
    IndexedDbService.getConfiguration.mockReturnValue("A graph");
    await loadConfigurationFromIndexedDb({ dispatch }, "graph1");
    expect(IndexedDbService.getConfiguration).toHaveBeenCalledWith("graph1");
  });
  it("calls loadGraph", async () => {
    IndexedDbService.getConfiguration = vi.fn();
    IndexedDbService.getConfiguration.mockReturnValue({
      id: "A configuration",
    });
    await loadConfigurationFromIndexedDb({ dispatch }, "conf1");
    expect(dispatch).toHaveBeenCalledWith("loadConfiguration", {
      id: "A configuration",
    });
  });
  it("it applies configurations", async () => {
    IndexedDbService.getConfiguration = vi.fn();
    IndexedDbService.getConfiguration.mockReturnValue({
      id: "A configuration",
    });
    await loadConfigurationFromIndexedDb({ dispatch }, "conf1");
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });
  it("sets error message when IndexedDb errors", async () => {
    IndexedDbService.getConfiguration = vi.fn();
    IndexedDbService.getConfiguration.mockImplementationOnce(
      new Error("An error occured"),
    );
    await loadConfigurationFromIndexedDb({ dispatch }, "non existent");
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("An error occured"),
    );
  });
});

describe("removeConfigurationFromIndexedDb", () => {
  let dispatch;
  let commit;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    commit = vi.fn();
    state = {
      storedConfigurationNames: ["GraphNo1", "MamboNo2"],
    };
  });
  it("calls indexedDb with correct name", async () => {
    IndexedDbService.deleteConfiguration = vi.fn();
    await removeConfigurationFromIndexedDb(
      { dispatch, commit, state },
      "MamboNo2",
    );
    expect(IndexedDbService.deleteConfiguration).toHaveBeenCalledWith(
      "MamboNo2",
    );
  });
  it("sets new configuration names", async () => {
    IndexedDbService.deleteConfiguration = vi.fn();
    await removeConfigurationFromIndexedDb(
      { dispatch, commit, state },
      "MamboNo2",
    );
    expect(commit).toHaveBeenCalledWith("SET_STORED_CONFIGURATION_NAMES", [
      "GraphNo1",
    ]);
  });
  it("sets success message", async () => {
    IndexedDbService.deleteConfiguration = vi.fn();
    await removeConfigurationFromIndexedDb(
      { dispatch, commit, state },
      "MamboNo2",
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setSuccess",
      "Configuration deleted",
    );
  });
  it("sets error message when IndexedDb errors", async () => {
    IndexedDbService.deleteConfiguration = vi.fn();
    IndexedDbService.deleteConfiguration.mockImplementationOnce(
      new Error("An error occured"),
    );
    await removeConfigurationFromIndexedDb(
      { dispatch, commit, state },
      "MamboNo2",
    );
    expect(dispatch).toHaveBeenCalledWith(
      "setError",
      new Error("An error occured"),
    );
  });
});

describe("loadConfiguration", () => {
  let commit;
  let dispatch;
  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
  });
  it("sets success message", () => {
    loadConfiguration({ dispatch, commit }, { name: "a config" });
    expect(dispatch).toHaveBeenCalledWith(
      "setSuccess",
      "Loaded configuration successfully",
    );
  });
  it("calls SET_CONFIGURATION", () => {
    loadConfiguration({ dispatch, commit }, { name: "a config" });
    expect(commit).toHaveBeenCalledWith("SET_CONFIGURATION", {
      name: "a config",
    });
  });
});

describe("downloadConfiguration", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      configurations: {
        name: "Here be configurations",
      },
    };
  });
  it("sets the download URL", () => {
    global.URL.createObjectURL = vi.fn();
    global.URL.createObjectURL.mockReturnValue(
      "blob://out-of-tune.org/123123123123",
    );
    downloadConfiguration({ commit, rootState });
    expect(commit).toHaveBeenCalledWith(
      "SET_CONFIGURATION_URL",
      "blob://out-of-tune.org/123123123123",
    );
  });
});
