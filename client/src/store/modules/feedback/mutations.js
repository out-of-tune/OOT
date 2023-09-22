const SET_FEEDBACK_MODAL_STATE = (state, modalState) => {
  state.feedbackModalOpen = modalState;
};

export const mutations = {
  SET_FEEDBACK_MODAL_STATE,
};

export default mutations;
