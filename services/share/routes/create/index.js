import { Config } from '@out-of-tune/settings'
import fs from "fs/promises"
import base58 from "base58"
import arango from '../../datasources/arangodb/index.js'

const INITIAL_ID = 'abcd'

async function create(req, res) {
    const type = req.params.type
    const data = req.body.object

    var key = await arango.share.fetch(type)
    
    if (!key || key.length === 0 || !key[0].key) key = [await arango.share.create(INITIAL_ID, type)]
    const id = key[0].key

    await fs.writeFile(`${Config.share.directory}/${type}/${id}`, data)
    await arango.share.update(key[0].id, { key: increment(id) })

    res.json({
        id,
        type,
        uri: `${type}/${id}`
    })
}

function increment(id) {
    const num = base58.base58_to_int(id)
    return base58.int_to_base58(num + 1)
}

export default create