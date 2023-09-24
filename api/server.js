import { ApolloServer } from '@apollo/server'

import { middlewares } from './auth'
import { formatError as _formatError, applyMiddleware } from './helpers'

import ArangoAPI from './datasources/arangodb'
import SpotifyAPI from './datasources/spotify'

import resolvers from './resolvers'
import type_defs from './schema'
import schemaDirectives from './directives'

require('dotenv').config()

import { memcache, responseCache } from './caching'
const arango = new ArangoAPI()
arango.connect(
    `http://${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}`, 
    process.env.ARANGODB_DATABASE, 
    process.env.ARANGODB_USER, 
    process.env.ARANGODB_PASSWORD
)

const spotifyApiInstance = new SpotifyAPI(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET, process.env.SPOTIFY_SCOPE)
spotifyApiInstance.start()

const port = process.env.APOLLO_PORT
//const address = "0.0.0.0"

const server = new ApolloServer({
    cors: true,  
    typeDefs: type_defs,
    formatError: _formatError,
    resolvers,
    debug: process.env.NODE_ENV === 'development',
    playground: false, //process.env.NODE_ENV === 'development',
    schemaDirectives,
    dataSources: () => ({
        spotify: spotifyApiInstance,
        arango: arango
    }),
    context: applyMiddleware([
        middlewares.authenticate_client(arango),
        middlewares.authenticate_user(arango)
    ]),
    cache: memcache,
    plugins: [ responseCache ]
})



server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
})
