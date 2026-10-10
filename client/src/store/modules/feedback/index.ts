import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import actions from "./actions";
import mutations from "./mutations";

export interface FeedbackState {
  feedbackModalOpen: boolean;
}

export const feedback: Module<FeedbackState, RootState> = {
  state: () => ({ feedbackModalOpen: false }),
  actions,
  mutations,
};

export default feedback;
