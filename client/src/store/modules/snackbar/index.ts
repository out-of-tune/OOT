import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export type SnackColor = "error" | "info" | "success";

export interface SnackbarState {
  message: string;
  color: SnackColor;
  /** Increases with every message, so the same text twice still shows twice. */
  messageId: number;
}

export const snackbar: Module<SnackbarState, RootState> = {
  state: () => ({ message: "", color: "info", messageId: 0 }),
  actions,
  mutations,
};

export default snackbar;
