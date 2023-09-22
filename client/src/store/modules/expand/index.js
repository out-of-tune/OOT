import actions from "./actions";

export const expand = {
  state: {
    failedExpandedConnections: [],
  },
  actions,
  mutations: {
    SET_FAILED_EXPANDED_CONNECTIONS: function (state, connections) {
      state.failedExpandedConnections = connections;
    },
  },
};

export default expand;
