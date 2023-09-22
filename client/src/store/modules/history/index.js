import actions from "./actions";
import mutations from "./mutations";

export const history = {
  state: {
    historyIndex: -1,
    changes: [],
    clickHistory: {},
  },
  actions,
  mutations,
};

export default history;
