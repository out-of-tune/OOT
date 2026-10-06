import type { MutationTree } from "vuex";
import type { ThemeId } from "@/lib/themes";
import type { AppearanceState, StoredColors } from "./index";

export const mutations = {
  SET_PENDING_REQUEST_COUNT(state, count: number) {
    state.pendingRequestCount = count;
  },
  SET_COLORS(state, colors: StoredColors) {
    state.colors = colors;
  },
  SET_HIGHLIGHT_ACTIVE(state, highlight: boolean) {
    state.highlight = highlight;
  },
  SET_COVERS(state, covers: boolean) {
    state.covers = covers;
  },
  SET_UI_THEME(state, theme: ThemeId | "auto") {
    state.uiTheme = theme;
  },
  SET_AUTO_THEME(state, theme: ThemeId) {
    state.autoTheme = theme;
  },
} satisfies MutationTree<AppearanceState>;

export default mutations;
