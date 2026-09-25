import type { ActionTree } from "vuex";
import { handleGraphqlTokenError } from "@/lib/token";
import GraphService from "@/services/GraphService";
import type { Context, RootState } from "@/store/types";
import type { FeedbackState } from "./index";

type Ctx = Context<FeedbackState>;

export interface FeedbackInput {
  mail?: string;
  feedback: string;
  type?: string;
  group?: string;
}

const CREATE_FEEDBACK = `
  mutation CreateFeedback($feedback: String!, $email: String, $type: String, $group: String) {
    createfeedback(feedback: $feedback, email: $email, type: $type, group: $group)
  }
`;

export const actions = {
  changeFeedbackModalState({ commit, state }: Ctx, open?: boolean) {
    commit("SET_FEEDBACK_MODAL_STATE", open ?? !state.feedbackModalOpen);
  },

  /** Sends the feedback with GraphQL variables, so quotes in the text cannot break the query. Returns true on success. */
  async sendFeedback(
    { dispatch, rootState }: Ctx,
    { mail = "anonym", feedback, type = "none", group = "none" }: FeedbackInput,
  ): Promise<boolean> {
    try {
      const result = await handleGraphqlTokenError(
        GraphService.getNodes.bind(GraphService),
        [CREATE_FEEDBACK, { feedback, email: mail, type, group }],
        dispatch,
        rootState,
      );
      if (result?.createfeedback) {
        dispatch("setSuccess", "Thanks for your feedback!");
        return true;
      }
      dispatch("setError", new Error("Feedback could not be sent"));
    } catch (error) {
      dispatch("setError", error);
    }
    return false;
  },
} satisfies ActionTree<FeedbackState, RootState>;

export default actions;
