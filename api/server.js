var { ApolloServer } = require('apollo-server')

const auth = require('./auth')
const helpers = require('./helpers')

const ArangoAPI = require('./datasources/arangodb')
const SpotifyAPI = require('./datasources/spotify')

const resolvers = require('./resolvers')
const type_defs = require('./schema')
const schemaDirectives = require('./directives')

require('dotenv').config()

const cache = require('./caching')
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
    formatError: helpers.formatError,
    resolvers,
    debug: process.env.NODE_ENV === 'development',
    playground: false, //process.env.NODE_ENV === 'development',
    schemaDirectives,
    dataSources: () => ({
        spotify: spotifyApiInstance,
        arango: arango
    }),
    context: helpers.applyMiddleware([
        auth.middlewares.authenticate_client(arango),
        auth.middlewares.authenticate_user(arango)
    ]),
    cache: cache.memcache,
    plugins: [ cache.responseCache ]
})



server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
})
