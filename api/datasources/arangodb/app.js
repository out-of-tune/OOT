const BaseAPI = require('./base')

class AppAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this.collection = 'App'
    }


    async create(key, secret, name) {
        return await super._create(this.collection, { key, secret, name })
    }

    async search(value, field, limit) {
        return await this._search(this.collection, value, field, limit)
    }

    async fetch(key) {
        return await this.search(key, 'key', 1)
    }

    async update(id, fields) {
        return await this.set_fields(this.collection, id, fields)
    }

    static async createAPI(db, key, secret) {
        const api = await super.createAPI(db)
        const cc = await api.fetch(key)
        if (cc.length == 1) {
            const client = cc[0]
            if (client.secret !== secret) {
                console.log('change secret')
                await api.update(client.id, { secret })
            }
        }
        if (cc.length == 0) {
            await api.create(key, secret, 'OOT')
        }
        return api
    }


}

module.exports = AppAPI
