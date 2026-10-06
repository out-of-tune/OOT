import type { MutationTree } from "vuex";
import type { ActiveCompass, CompassState } from "./index";

export const mutations = {
  SET_COMPASS(state, compass: ActiveCompass | null) {
    state.active = compass;
  },
} satisfies MutationTree<CompassState>;

export default mutations;
