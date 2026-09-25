// @vitest-environment jsdom
import SpotifyTokenService from "@/services/SpotifyTokenService";
import AuthenticationService from "@/services/AuthenticationService";
vi.mock("@/services/SpotifyTokenService");
vi.mock("@/services/AuthenticationService");
vi.mock("@/services/BaseService");

import { actions } from "../actions";

const {
  login,
  setAccessToken,
  setExpiryTime,
  refreshToken,
  setLoginState,
  refreshTokenAfterTimeout,
  requireAccessToken,
  logout,
} = actions;

describe("refreshTokenAfterTimeout", () => {
  let dispatch;
  let state;
  beforeEach(() => {
    dispatch = vi.fn();
    state = {
      expiryTime: 100,
    };
    vi.useFakeTimers();
  });
  it("refreshes token after timeout", async () => {
    refreshTokenAfterTimeout({ state, dispatch });
    vi.advanceTimersByTime(state.expiryTime * 1000);
    expect(dispatch).toHaveBeenCalledWith("refreshToken");
  });
});

describe("setExpiryTime", () => {
  let commit;
  let time;
  beforeEach(() => {
    commit = vi.fn();
    time = "1323";
  });
  it("sets the expiry time", () => {
    setExpiryTime({ commit }, time);
    expect(commit).toHaveBeenCalledWith("SET_EXPIRY_TIME", Number(time));
  });
});

describe("requireAccessToken", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      authentication: {},
    };
  });
  it("Obtains the token and writes it to the database", async () => {
    SpotifyTokenService.getAccessToken.mockReturnValue({
      publicToken: { token: "IBimsEinsToken" },
    });
    await requireAccessToken({ commit, rootState });
    expect(commit).toHaveBeenCalledWith(
      "SET_SPOTIFY_ACCESS_TOKEN",
      "IBimsEinsToken",
    );
  });
});

describe("refreshToken", () => {
  let dispatch;
  beforeEach(() => {
    dispatch = vi.fn();
  });
  it("gets a new token from the session cookie", async () => {
    AuthenticationService.refreshToken = vi.fn();
    AuthenticationService.refreshToken.mockResolvedValue({
      access_token: "newToken",
      expires_in: 3600,
    });
    await refreshToken({ dispatch });
    expect(dispatch).toHaveBeenCalledWith("setExpiryTime", 3600);
    expect(dispatch).toHaveBeenCalledWith("setAccessToken", "newToken");
  });
  it("throws when there is no session", async () => {
    AuthenticationService.refreshToken = vi.fn();
    AuthenticationService.refreshToken.mockRejectedValue(new Error("401"));
    await expect(refreshToken({ dispatch })).rejects.toThrow("401");
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("setLoginState", () => {
  let commit;
  beforeEach(() => {
    commit = vi.fn();
  });
  it("sets the login state", () => {
    setLoginState({ commit }, true);
    expect(commit).toHaveBeenCalledWith("SET_LOGIN_STATE", true);
  });
});

describe("setAccessToken", () => {
  let dispatch;
  let commit;
  beforeEach(() => {
    dispatch = vi.fn();
    commit = vi.fn();
  });
  it("calls SET_ACCESS_TOKEN", async () => {
    setAccessToken({ commit, dispatch }, "12345");
    expect(commit).toHaveBeenCalledWith("SET_ACCESS_TOKEN", "12345");
  });
  it("sets login state", async () => {
    setAccessToken({ commit, dispatch }, "12345");
    expect(dispatch).toHaveBeenCalledWith("setLoginState", true);
  });
  it("refreshes token", async () => {
    setAccessToken({ commit, dispatch }, "12345");
    expect(dispatch).toHaveBeenCalledWith("refreshTokenAfterTimeout");
  });
});

describe("logout", () => {
  let dispatch;
  let commit;
  beforeEach(() => {
    dispatch = vi.fn();
    commit = vi.fn();
  });
  it("calls SET_ACCESS_TOKEN", async () => {
    logout({ commit, dispatch });
    expect(commit).toHaveBeenCalledWith("DELETE_USER_STATE");
  });
  it("sets login state", async () => {
    logout({ commit, dispatch });
    expect(dispatch).toHaveBeenCalledWith("setLoginState", false);
  });
  it("deletes current user object", async () => {
    logout({ commit, dispatch });
    expect(dispatch).toHaveBeenCalledWith("deleteCurrentUser");
  });
  it("disconnects the Spotify player and deletes the session cookie", async () => {
    AuthenticationService.logout = vi.fn().mockResolvedValue(undefined);
    await logout({ commit, dispatch });
    expect(dispatch).toHaveBeenCalledWith("disconnectSpotifyPlayer");
    expect(AuthenticationService.logout).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith("setInfo", "Logged out");
  });
});

describe("login", () => {
  beforeEach(() => {
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        href: "",
      },
    });
  });
  it("calls authentication service", async () => {
    await login();
    expect(AuthenticationService.get_oauth2_login_page).toHaveBeenCalled();
  });
  it("sets window.location to link", async () => {
    AuthenticationService.get_oauth2_login_page.mockReturnValue(
      "out-of-tune.org",
    );
    await login();
    expect(global.window.location.href).toBe("out-of-tune.org");
  });
});
