import actions from "./actions";
import mutations from "./mutations";

export const graph_io = {
  state: {
    storedGraphNames: [],
    graphObject: {},
  },

  actions,
  mutations,
};

export default graph_io;
