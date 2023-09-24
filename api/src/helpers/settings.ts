import dotenv from 'dotenv'
dotenv.config()

export const API_PORT = Number.parseInt(process.env.APOLLO_PORT ?? "3003")
export const MEMCACHED_HOST = process.env.MEMCACHED_HOST ?? "memcached"

export const ARANGO_HOST = process.env.ARANGODB_HOST ?? "arangodb"
export const ARANGO_PORT = process.env.ARANGODB_PORT ?? 8529
export const ARANGO_DB = process.env.ARANGODB_DATABASE ?? "OOT"
export const ARANGO_USER = process.env.ARANGODB_USER
export const getArangoPassword = () => process.env.ARANGODB_PASSWORD

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
export const SPOTIFY_SCOPE = process.env.SPOTIFY_SCOPE

export const NODE_ENV = process.env.NODE_ENV ?? "production"
export const isDev = NODE_ENV === "development"