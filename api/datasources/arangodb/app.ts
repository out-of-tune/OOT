import BaseAPI from './base'

class AppAPI extends BaseAPI {
    static collection = "App"
    static async onConnect(db: any): Promise<void> {
        super.onConnect(db)
        new AppAPI(db)._create_initial(process.env.CLIENT_KEY, process.env.CLIENT_SECRET)
    }

    async create(key, secret, name) {
        return await super._create(AppAPI.collection, { key, secret, name })
    }

    async search(value, field, limit) {
        return await this._search(AppAPI.collection, value, field, limit)
    }

    async fetch(key) {
        return await this.search(key, 'key', 1)
    }

    async update(id, fields) {
        return await this.set_fields(AppAPI.collection, id, fields)
    }


    private async _create_initial(key, secret) {
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

export default AppAPI
