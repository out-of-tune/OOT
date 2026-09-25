import type { ActionTree } from "vuex";
import AuthenticationService from "@/services/AuthenticationService";
import SpotifyTokenService from "@/services/SpotifyTokenService";
import type { Context, RootState } from "@/store/types";
import type { AuthenticationState } from "./index";

type Ctx = Context<AuthenticationState>;

/** Refresh the token this many milliseconds before it expires. */
const REFRESH_MARGIN = 5000;

/** Only one refresh timer may run. A new token replaces the old timer. */
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

const clearRefreshTimer = () => {
  if (refreshTimer !== undefined) clearTimeout(refreshTimer);
  refreshTimer = undefined;
};

export const actions = {
  async login() {
    const result = await AuthenticationService.get_oauth2_login_page();
    window.location.href = result;
  },

  setLoginState({ commit }: Ctx, loggedIn: boolean) {
    commit("SET_LOGIN_STATE", loggedIn);
  },

  refreshTokenAfterTimeout({ state, dispatch }: Ctx) {
    clearRefreshTimer();
    const delay = Math.max(
      state.expiryTime * 1000 - REFRESH_MARGIN,
      REFRESH_MARGIN,
    );
    refreshTimer = setTimeout(() => {
      refreshTimer = undefined;
      Promise.resolve(dispatch("refreshToken")).catch(() => {
        dispatch("setLoginState", false);
        dispatch("disconnectSpotifyPlayer");
        dispatch("setInfo", "Your Spotify session ended. Log in again.");
      });
    }, delay);
  },

  /** Gets a new user access token from the session cookie. Throws when the user is not logged in. */
  async refreshToken({ dispatch }: Ctx) {
    const result = await AuthenticationService.refreshToken();
    dispatch("setExpiryTime", result.expires_in);
    dispatch("setAccessToken", result.access_token);
  },

  setAccessToken({ commit, dispatch }: Ctx, token: string) {
    commit("SET_ACCESS_TOKEN", token);
    dispatch("setLoginState", true);
    dispatch("refreshTokenAfterTimeout");
  },

  setExpiryTime({ commit }: Ctx, time: number | string) {
    commit("SET_EXPIRY_TIME", Number(time));
  },

  /** Gets the public Spotify token, used when the user is not logged in. */
  async requireAccessToken({ commit }: Ctx) {
    const result = await SpotifyTokenService.getAccessToken();
    commit("SET_SPOTIFY_ACCESS_TOKEN", result.publicToken.token);
    return result;
  },

  /** Ends the out-of-tune session. The user stays logged in to Spotify itself. */
  async logout({ dispatch, commit }: Ctx) {
    clearRefreshTimer();
    commit("DELETE_USER_STATE");
    dispatch("setLoginState", false);
    dispatch("deleteCurrentUser");
    dispatch("clearPlaylists");
    dispatch("disconnectSpotifyPlayer");
    try {
      await AuthenticationService.logout();
    } catch (error) {
      console.warn("The session cookie could not be deleted", error);
    }
    dispatch("setInfo", "Logged out");
  },
} satisfies ActionTree<AuthenticationState, RootState>;

export default actions;
