require('dotenv').config()

module.exports = {
    ARANGO_HOST: process.env.ARANGODB_HOST ?? "arangodb",
    ARANGO_PORT: process.env.ARANGODB_PORT ?? "8529",
    ARANGO_DB: process.env.ARANGODB_HOST ?? "OOT",
    ARANGO_USER: process.env.ARANGODB_USER,
    getArangoPassword: () => process.env.ARANGODB_PASSWORD,
    PROXY_URI: process.env.PROXY_URI,
    SPOTIFY_SCOPE: process.env.SPOTIFY_SCOPE,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
}