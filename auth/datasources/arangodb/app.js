const BaseAPI = require('./base')

class AppAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('App')
        this.collection = 'App'
    }

    async create(key, tier) {
        return await super.create(this.collection, {key, tier})
    }

    async search(value, field, limit) {
        return await this._search(this.collection, value, field, limit)
    }

    async fetch(key) {
        return await this.search(key, 'key', 1)
    }

    async update(id, fields, values) {
        return await this.set_fields(this.collection, id, fields, values)
    }
}

module.exports = AppAPI
