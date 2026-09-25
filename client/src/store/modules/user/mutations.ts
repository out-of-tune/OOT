import type { MutationTree } from "vuex";
import type { SpotifyUser } from "@/types/spotify";
import type { UserState } from "./index";

export const mutations = {
  SET_CURRENT_USER(state, user: Partial<SpotifyUser>) {
    state.me = user;
  },
} satisfies MutationTree<UserState>;

export default mutations;
