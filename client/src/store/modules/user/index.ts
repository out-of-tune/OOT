import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import type { SpotifyUser } from "@/types/spotify";
import actions from "./actions";
import mutations from "./mutations";

export interface UserState {
  me: Partial<SpotifyUser>;
}

export const user: Module<UserState, RootState> = {
  state: () => ({ me: {} }),
  actions,
  mutations,
};

export default user;
