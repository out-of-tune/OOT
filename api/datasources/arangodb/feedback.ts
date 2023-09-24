import BaseAPI from './base'

class FeedbackAPI extends BaseAPI {
    static collection = "Feedback"

    async create(feedback) {
        return await super._create(FeedbackAPI.collection, feedback)
    }
}

export default FeedbackAPI
