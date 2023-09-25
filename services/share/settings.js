module.exports = {
    PORT: process.env.SHARE_PORT ?? 4444,
    TYPES: process.env.SHARE_TYPES.split(' '),
    STORAGE_PATH: process.env.SHARE_LOC,
    ARANGO_HOST: process.env.ARANGODB_HOST ?? "arangodb",
    ARANGO_PORT: process.env.ARANGODB_PORT ?? 8529, 
    ARANGO_DB: process.env.ARANGODB_DATABASE ?? "OOT", 
    ARANGO_USER: process.env.ARANGODB_USER, 
    getArangoPassword: () => process.env.ARANGODB_PASSWORD
}