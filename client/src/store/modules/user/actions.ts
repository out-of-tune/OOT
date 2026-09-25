import type { ActionTree } from "vuex";
import SpotifyService from "@/services/SpotifyService";
import type { Context, RootState } from "@/store/types";
import type { UserState } from "./index";

type Ctx = Context<UserState>;

export const actions = {
  /** Loads the profile of the logged-in user, then connects the Spotify player of this tab. */
  async getCurrentUser({ commit, dispatch, rootState }: Ctx) {
    if (!rootState.authentication.loginState) return;
    const user = await SpotifyService.getCurrentUserProfile(
      rootState.authentication.accessToken,
    );
    commit("SET_CURRENT_USER", user);
    dispatch("connectSpotifyPlayer");
  },
  deleteCurrentUser({ commit }: Ctx) {
    commit("SET_CURRENT_USER", {});
  },
} satisfies ActionTree<UserState, RootState>;

export default actions;
