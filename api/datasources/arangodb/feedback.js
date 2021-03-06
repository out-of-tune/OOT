const BaseAPI = require('./base')

class FeedbackAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('Feedback')
        this.collection = 'Feedback'
    }


    async create(feedback) {
        return await super._create(this.collection, feedback)
    }
}

module.exports = FeedbackAPI
