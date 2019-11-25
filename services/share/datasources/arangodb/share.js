const BaseAPI = require('./base')

class ShareAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('Share')
        this.collection = 'Share'
    }

    async create(key, type) {
        return await super.create(this.collection, {key, type})
    }

    async search(value, field, limit) {
        return await this._search(this.collection, value, field, limit)
    }

    async fetch(type) {
        return await this.search(type, 'type', 1)
    }

    async update(id, fields) {
        return await this.set_fields(this.collection, id, fields)
    }
}

module.exports = ShareAPI
