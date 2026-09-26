import type { ActionTree } from "vuex";
import { statusOf } from "@/lib/token";
import SpotifyService from "@/services/SpotifyService";
import type { Context, RootState } from "@/store/types";
import type { UserState } from "./index";

type Ctx = Context<UserState>;

export const actions = {
  /**
   * Loads the profile of the logged-in user, then connects the Spotify player of this tab.
   * The player also connects without a profile: the SDK reports a Free account itself.
   */
  async getCurrentUser({ commit, dispatch, rootState }: Ctx) {
    if (!rootState.authentication.loginState) return;
    try {
      const user = await SpotifyService.getCurrentUserProfile(
        rootState.authentication.accessToken,
      );
      commit("SET_CURRENT_USER", user);
    } catch (error) {
      console.warn("The Spotify profile could not be loaded", error);
      if (statusOf(error) === 403)
        dispatch(
          "setError",
          "Spotify refused this account. In development mode, the app owner must add it in the Spotify dashboard.",
        );
    }
    dispatch("connectSpotifyPlayer");
  },
  deleteCurrentUser({ commit }: Ctx) {
    commit("SET_CURRENT_USER", {});
  },
} satisfies ActionTree<UserState, RootState>;

export default actions;
