const SET_PENDING_REQUEST_COUNT = (state, count) => {
  state.pendingRequestCount = count;
};

const SET_COLORS = (state, colors) => {
  state.colors = colors;
};

const SET_HIGHLIGHT_ACTIVE = (state, highlight) => {
  state.highlight = highlight;
};

export const mutations = {
  SET_PENDING_REQUEST_COUNT,
  SET_COLORS,
  SET_HIGHLIGHT_ACTIVE,
};

export default mutations;
