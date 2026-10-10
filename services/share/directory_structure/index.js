const fs = require('node:fs/promises')

/** Creates one storage directory per share type. */
async function ensureTypeDirs(root, types) {
    await Promise.all(types.map(type => fs.mkdir(`${root}/${type}`, { recursive: true })))
}

module.exports = ensureTypeDirs
