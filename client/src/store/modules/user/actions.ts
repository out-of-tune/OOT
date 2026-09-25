import type { ActionTree } from "vuex";
import SpotifyService from "@/services/SpotifyService";
import type { Context, RootState } from "@/store/types";
import type { UserState } from "./index";

type Ctx = Context<UserState>;

export const actions = {
  async getCurrentUser({ commit, rootState }: Ctx) {
    if (!rootState.authentication.loginState) return;
    const user = await SpotifyService.getCurrentUserProfile(
      rootState.authentication.accessToken,
    );
    commit("SET_CURRENT_USER", user);
  },
  deleteCurrentUser({ commit }: Ctx) {
    commit("SET_CURRENT_USER", {});
  },
} satisfies ActionTree<UserState, RootState>;

export default actions;
