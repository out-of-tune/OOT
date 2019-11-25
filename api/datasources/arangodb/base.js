const DataLoader = require('dataloader')
const { aql } = require('arangojs')
const InvalidInputError = require('../../errors/InvalidInputError')

class BaseAPI {
    constructor(db) {
        this.db = db
        this._id_loader = new DataLoader(ids => this.get_ids(ids, this.db))
    }

    async get_ids(ids, db=this.db) {
        const query = aql`
        FOR id IN ${ids}
            RETURN Document(id)
        `
        const cursor = await db.query(query)
        return cursor.all()
    }

    async _search(collection, value, field, limit) {
        limit = typeof(limit) !== 'undefined' ? limit : 1
        const query = aql`
        FOR n IN ${this.db.collection(collection)}
            FILTER n.${field} == ${value}
            LIMIT ${limit}
            RETURN n
        `
        const cursor = await this.db.query(query)
        const data = await cursor.all()
        return data.map(this.reducer)
    }

    async get_id(id) {
        return this.reducer(await this._id_loader.load(id))
    }

    reducer(doc) {
        if (!doc) return doc
        const {
            _id,
            _key,
            ...obj
        } = doc
        return {
            id: _id,
            ...obj
        }
    }

    async _create(collection, data) {
        const res = await this.db.collection(collection).save(data)
        
        return {
            ...data,
            id: res._id
        }
    }

    async link(from, to, edge_collection, obj={}) {
        const edge = {
            _from: from,
            _to: to,
            ...obj
        }
        return await this._create(edge_collection, edge)
    }

    async set_fields(collection, id, fields) {
        if (typeof(fields) !== 'object') throw new InvalidInputError("'fields' must be an object")
        
        const query = aql`
        LET d = Document(${id})
        UPDATE d WITH
            ${fields}
        IN ${this.db.collection(collection)}
        RETURN d`
        
        const cursor = await this.db.query(query)
        return this.reducer(await cursor.next())

    }

    async _collection(name, edge=false) {
        try {
            const collection = edge ? this.db.edgeCollection(name) : this.db.collection(name)
            if (!await collection.exists()) {
                console.log(`Creating '${name}' collection...`)
                await collection.create()
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    initialize(config) {
        this.context = config.context
    }

    
}

module.exports = BaseAPI