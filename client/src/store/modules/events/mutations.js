const SET_GROUP_MOVE_ACTIVE = (state, active) => {
  state.groupMoveActive = active;
};

const SET_MOVE_ORIGIN_POSITION = (state, position) => {
  if (position) {
    const x = position.x;
    const y = position.y;
    state.moveOriginPosition = { x, y };
  } else {
    state.moveOriginPosition = position;
  }
};
const SET_AFFECTED_NODES_ORIGIN_POSITION = (state, nodesWithPosition) => {
  state.originNodePositions = [...nodesWithPosition];
};
const SET_MOUSE_PAUSED = (state, paused) => {
  state.mousePaused = paused;
};

const SET_MULTI_SELECT_OVERLAY = (state, multiSelectOverlay) => {
  state.multiSelectOverlay = multiSelectOverlay;
};

const SET_KEY_UP = (state, keyId) => {
  state.keysdown[keyId] = false;
};

const SET_KEY_DOWN = (state, keyId) => {
  state.keysdown[keyId] = true;
};

const SET_WAS_PAUSED = (state, paused) => {
  state.wasPaused = paused;
};
const SET_GRAPH_OVERLAY_MOUSE_DOWN = (state, down) => {
  state.graphOverlayMouseDown = down;
};

const SET_SHOW_TOUR = (state, show) => {
  state.showTour = show;
};

export const mutations = {
  SET_GROUP_MOVE_ACTIVE,
  SET_MOVE_ORIGIN_POSITION,
  SET_AFFECTED_NODES_ORIGIN_POSITION,
  SET_MOUSE_PAUSED,
  SET_MULTI_SELECT_OVERLAY,
  SET_KEY_UP,
  SET_KEY_DOWN,
  SET_WAS_PAUSED,
  SET_GRAPH_OVERLAY_MOUSE_DOWN,
  SET_SHOW_TOUR,
};

export default mutations;
