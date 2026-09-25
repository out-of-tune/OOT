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
      dispatch("refreshToken");
    }, delay);
  },

  async refreshToken({ state, dispatch }: Ctx) {
    const result = await AuthenticationService.refreshToken(state.refreshToken);
    dispatch("setAccessToken", result.access_token);
  },

  setAccessToken({ commit, dispatch }: Ctx, token: string) {
    commit("SET_ACCESS_TOKEN", token);
    dispatch("setLoginState", true);
    dispatch("refreshTokenAfterTimeout");
  },

  setRefreshToken({ commit }: Ctx, token: string) {
    commit("SET_REFRESH_TOKEN", token);
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

  logout({ dispatch, commit }: Ctx) {
    clearRefreshTimer();
    commit("DELETE_USER_STATE");
    dispatch("setLoginState", false);
    dispatch("deleteCurrentUser");
    dispatch("clearPlaylists");
    // Spotify has no logout API. Opening its logout page ends the Spotify session.
    // A blocked pop-up is not an error: the local session is already gone.
    const spotifyLogoutWindow = window.open(
      "https://accounts.spotify.com/en/logout",
      "Spotify Logout",
      "width=700,height=500,top=40,left=40",
    );
    if (spotifyLogoutWindow) setTimeout(() => spotifyLogoutWindow.close(), 200);
    dispatch("setInfo", "Logged out");
  },
} satisfies ActionTree<AuthenticationState, RootState>;

export default actions;
