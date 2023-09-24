import BaseAPI from './base';
class SourceAPI extends BaseAPI {
    constructor(db) {
        super(db);
    }
    async create_initial() {
        await this._collection('Source');
        const spotify = await this.fetch('Spotify');
        if (spotify && spotify.length === 0)
            this.create('Spotify', '0');
    }
    async create(name, _key) {
        return await super._create('Source', { _key, name });
    }
    async fetch(name) {
        return await this._search('Source', name, 'name', 1);
    }
}
export default SourceAPI;
