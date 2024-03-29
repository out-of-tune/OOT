import SpotifyService from "@/store/services/SpotifyService";

vi.mock("@/store/services/SpotifyService");
import { actions } from "../actions";

const { getCurrentUser, deleteCurrentUser } = actions;

describe("getCurrentUser", () => {
  let commit;
  let rootState;
  beforeEach(() => {
    commit = vi.fn();
    rootState = {
      authentication: {
        loginState: true,
        accessToken: "12345",
      },
    };
    SpotifyService.getCurrentUserProfile = vi.fn();
    SpotifyService.getCurrentUserProfile.mockReturnValue({ id: "userID" });
  });
  it("calls Spotify API", () => {
    getCurrentUser({ commit, rootState });
    expect(SpotifyService.getCurrentUserProfile).toHaveBeenCalledWith("12345");
  });
  it("sets user when logged in", async () => {
    await getCurrentUser({ commit, rootState });
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_USER", { id: "userID" });
  });
  it("does nothing when not logged in", async () => {
    rootState.authentication.loginState = false;
    await getCurrentUser({ commit, rootState });
    expect(commit).not.toHaveBeenCalled();
  });
});

describe("deleteCurrentUser", () => {
  let commit;

  beforeEach(() => {
    commit = vi.fn();
  });
  it("deletes current user", () => {
    deleteCurrentUser({ commit });
    expect(commit).toHaveBeenCalledWith("SET_CURRENT_USER", {});
  });
});
