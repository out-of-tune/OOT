const fs = require('node:fs/promises')
const path = require('node:path')
const arango = require('../../datasources/arangodb')
const { STORAGE_PATH } = require('../../settings')

/** Stores the uploaded object under a new id and returns its URI. */
async function create(req, res) {
    const type = req.params.type
    const data = req.body?.object
    if (typeof data !== 'string' || data.length === 0) {
        return res.status(400).json({ error: "'object' must be a non-empty string" })
    }
    if (!arango.share) {
        return res.status(503).json({ error: 'The database is not ready yet' })
    }

    const id = await arango.share.allocateKey(type)
    await fs.writeFile(path.join(STORAGE_PATH, type, id), data)

    res.json({ id, type, uri: `${type}/${id}` })
}

module.exports = create
