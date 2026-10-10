/** Shared helpers of the ArangoDB data sources. */
class BaseAPI {
    constructor(db) {
        this.db = db
    }

    /** Renames `_id` to `id` and drops `_key`. */
    reducer(doc) {
        if (!doc) return doc
        const { _id, _key, ...obj } = doc
        return { id: _id, ...obj }
    }

    async _collection(name) {
        const collection = this.db.collection(name)
        if (!await collection.exists()) {
            console.log(`Creating '${name}' collection...`)
            await collection.create()
        }
    }
}

module.exports = BaseAPI
