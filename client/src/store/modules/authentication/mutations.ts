import type { MutationTree } from "vuex";
import type { AuthenticationState } from "./index";

export const mutations = {
  SET_ACCESS_TOKEN(state, token: string) {
    state.accessToken = token;
  },
  SET_EXPIRY_TIME(state, time: number) {
    state.expiryTime = time;
  },
  SET_LOGIN_STATE(state, loggedIn: boolean) {
    state.loginState = loggedIn;
  },
  DELETE_USER_STATE(state) {
    state.accessToken = "";
    state.expiryTime = 10;
  },
} satisfies MutationTree<AuthenticationState>;

export default mutations;
