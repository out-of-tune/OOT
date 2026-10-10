import type { MutationTree } from "vuex";
import type { ShareState } from "./index";

export const mutations = {
  SET_SHARE_MODAL_STATE(state, modalState: boolean) {
    state.shareModalOpen = modalState;
  },
  SET_SHARE_LINK(state, link: string) {
    state.shareLink = link;
  },
} satisfies MutationTree<ShareState>;

export default mutations;
