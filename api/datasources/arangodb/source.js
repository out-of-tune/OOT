const { aql } = require('arangojs')
const BaseAPI = require('./base')

class SourceAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this.collection = "Source"
    }

    static async createAPI(db) {
        const api = await super.createAPI(db)
        const spotify = await api.fetch('Spotify')
        if (spotify && spotify.length === 0)
            await api.create('Spotify', '0')
        return api
    }

    async create(name, _key) {
        return await super._create('Source', { _key, name })
    }

    async fetch(name) {
        return await this._search('Source', name, 'name', 1)
    }
}

module.exports = SourceAPI
