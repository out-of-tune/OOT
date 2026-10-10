import type { MutationTree } from "vuex";
import type { SnackbarState, SnackColor } from "./index";

export const mutations = {
  SET_MESSAGE(state, message: string) {
    state.message = message;
    state.messageId = (state.messageId ?? 0) + 1;
  },
  SET_SNACK_COLOR(state, color: SnackColor) {
    state.color = color;
  },
} satisfies MutationTree<SnackbarState>;

export default mutations;
