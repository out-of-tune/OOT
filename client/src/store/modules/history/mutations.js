const SET_HISTORY_INDEX = (state, index) => {
  state.historyIndex = index;
};

const SET_CHANGES = (state, changes) => {
  state.changes = changes;
};
const ADD_TO_CLICK_HISTORY = (state, { node, data }) => {
  state.clickHistory[node.id] = state.clickHistory[node.id]
    ? [...state.clickHistory[node.id], { ...data }]
    : [{ ...data }];
};

export const mutations = {
  SET_HISTORY_INDEX,
  SET_CHANGES,
  ADD_TO_CLICK_HISTORY,
};

export default mutations;
