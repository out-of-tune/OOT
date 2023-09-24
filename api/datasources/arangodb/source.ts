import BaseAPI from './base'

class SourceAPI extends BaseAPI {
    static collection = "Source"
    static async onConnect(db) {
        super.onConnect(db)
        const sources = new SourceAPI(db)
        const spotify = await sources.fetch('Spotify')
        if (spotify && spotify.length === 0)
            sources.create('Spotify', '0')
    }

    create(name, _key) {
        return super._create('Source', { _key, name })
    }

    fetch(name) {
        return this._search('Source', name, 'name', 1)
    }
}

export default SourceAPI
