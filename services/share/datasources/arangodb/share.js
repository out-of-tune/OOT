const { aql } = require('arangojs')
const base58 = require('base58')
const BaseAPI = require('./base')

/** How often a request retries after a parallel request took its id. */
const MAX_ATTEMPTS = 20

/** First id of each share type. */
const INITIAL_ID = 'abcd'

/** 412: the document changed since it was read. 409: a document with this key exists. */
const isConflict = error => error.code === 412 || error.code === 409

function increment(id) {
    return base58.int_to_base58(base58.base58_to_int(id) + 1)
}

/** Keeps one counter document per share type: `{ type, key }`, where `key` is the next free id. */
class ShareAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this.collection = 'Share'
    }

    ensureCollection() {
        return this._collection(this.collection)
    }

    /**
     * Returns a new id for the type. Parallel requests cannot get the same id: the update only
     * succeeds if the counter document did not change since it was read (optimistic locking).
     * The loser of a race reads again and retries.
     */
    async allocateKey(type) {
        const collection = this.db.collection(this.collection)
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const cursor = await this.db.query(aql`
                FOR s IN ${collection}
                    FILTER s.type == ${type}
                    LIMIT 1
                    RETURN s`)
            const existing = await cursor.next()
            const key = existing?.key || INITIAL_ID
            try {
                if (existing) {
                    await collection.update(existing._key, { key: increment(key) }, { ifMatch: existing._rev })
                } else {
                    // The type is the document key, so a second insert of the same type fails.
                    await collection.save({ _key: type, type, key: increment(key) })
                }
                return key
            } catch (error) {
                if (!isConflict(error)) throw error
            }
        }
        throw new Error(`Could not allocate a ${type} id after ${MAX_ATTEMPTS} attempts`)
    }
}

module.exports = ShareAPI
module.exports.increment = increment
