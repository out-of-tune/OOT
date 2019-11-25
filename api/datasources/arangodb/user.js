const { aql } = require('arangojs')
const BaseAPI = require('./base')

class UserAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('User')
    }


    async create(user, roles) {
        return await super._create('User', {...user, roles})
    }

    async search(value, field, limit) {
        const data = await this._search('User', value, field, limit)
        data.forEach(user => this._id_loader.prime(user.id, user))
        return data
    }

    async byName(name, limit) {
        const query = aql`
        FOR u IN User
            FILTER LOWER(u.name) LIKE LOWER(${'%' + name + '%'})
            LIMIT ${limit}
            RETURN u`
        const cursor = await this.db.query(query)
        const data = (await cursor.all()).map(this.reducer)
        data.forEach(user => this._id_loader.prime(user.id, user))
        return data
    }

    async fetch(email) {
        return await this.search(email, 'email', 1)
    }

    async update(id, fields, values) {
        return await this.set_fields('User', id, fields, values)
    }



}

module.exports = UserAPI
