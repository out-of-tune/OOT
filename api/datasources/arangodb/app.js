const BaseAPI = require('./base')

class AppAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('App')
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

    async create_initial(key, secret) {
        const cc = await this.fetch(key)
        if (cc.length == 1) {
            const client = cc[0]
            if (client.secret !== secret) {
                console.log('change secret')
                this.update(client.id, { secret })
            }
        }
        if (cc.length == 0) {
            this.create(key, secret, 'OOT')
        }
    }


}

module.exports = AppAPI
