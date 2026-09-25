import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface AuthenticationState {
  accessToken: string;
  refreshToken: string;
  /** Lifetime of the access token in seconds. */
  expiryTime: number;
  loginState: boolean;
}

export const authentication: Module<AuthenticationState, RootState> = {
  state: () => ({
    accessToken: "",
    refreshToken: "",
    expiryTime: 10,
    loginState: false,
  }),
  actions,
  mutations,
};

export default authentication;
