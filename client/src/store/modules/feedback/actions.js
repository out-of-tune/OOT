import GraphService from "@/store/services/GraphService";
import { handleGraphqlTokenError } from "@/assets/js/TokenHelper";

const changeFeedbackModalState = ({ commit, state }) => {
  const modalState = !state.feedbackModalOpen;
  commit("SET_FEEDBACK_MODAL_STATE", modalState);
};

const sendFeedback = async (
  { dispatch, rootState },
  { mail = "anonym", feedback, type = "none", group = "none" },
) => {
  const query = `
        mutation {
            createfeedback(feedback: "${feedback}", email: "${mail}", type: "${type}", group: "${group}")
        }
    `;

  const result = await handleGraphqlTokenError(
    (query, token) => {
      return GraphService.getNodes(query, token);
    },
    [query],
    dispatch,
    rootState,
  );

  console.log(result);
  if (result) {
    dispatch("setSuccess", "Thanks for your feedback!");
  }
};

export const actions = {
  changeFeedbackModalState,
  sendFeedback,
};

export default actions;
