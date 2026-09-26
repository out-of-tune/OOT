import type { MutationTree } from "vuex";
import type { FeedbackState } from "./index";

export const mutations = {
  SET_FEEDBACK_MODAL_STATE(state, modalState: boolean) {
    state.feedbackModalOpen = modalState;
  },
} satisfies MutationTree<FeedbackState>;

export default mutations;
