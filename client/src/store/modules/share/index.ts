import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface ShareState {
  shareModalOpen: boolean;
  shareLink: string;
}

export const share: Module<ShareState, RootState> = {
  state: () => ({ shareModalOpen: false, shareLink: "" }),
  actions,
  mutations,
};

export default share;
