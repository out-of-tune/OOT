require('dotenv').config({ quiet: true })

module.exports = {
    PORT: Number(process.env.SHARE_PORT ?? 4444),
    TYPES: (process.env.SHARE_TYPES ?? 'graph settings').split(' ').filter(Boolean),
    STORAGE_PATH: process.env.SHARE_LOC ?? './data',
    ARANGO_HOST: process.env.ARANGODB_HOST ?? 'arangodb',
    ARANGO_PORT: process.env.ARANGODB_PORT ?? 8529,
    ARANGO_DB: process.env.ARANGODB_DATABASE ?? 'OOT',
    ARANGO_USER: process.env.ARANGODB_USER ?? 'root',
    getArangoPassword: () => process.env.ARANGODB_PASSWORD ?? ''
}
