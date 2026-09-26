import BaseAPI from "./base.js";

class FeedbackAPI extends BaseAPI {
  static collection = "Feedback";

  async create(feedback: Record<string, unknown>) {
    return this._create(FeedbackAPI.collection, feedback);
  }
}

export default FeedbackAPI;
