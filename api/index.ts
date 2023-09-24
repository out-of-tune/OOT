import dotenv from 'dotenv'
dotenv.config()

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import auth from './auth/index.js';
import helpers from './helpers/index.js';

import ArangoAPI from './datasources/arangodb/index.js';
import SpotifyAPI from './datasources/spotify/index.js';

import resolvers from './resolvers/index.js';
import { readFileSync } from 'fs';
import schemaDirectives from './directives/index.js';

import cache from './caching/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import authDirectiveTransformer from './directives/RequireAuthDirective.js';


const port = process.env.APOLLO_PORT
const type_defs = readFileSync('./schema/schema.graphql', { encoding: 'utf-8' });;

let schema = makeExecutableSchema({
    typeDefs: type_defs,
    resolvers
})

schema = authDirectiveTransformer(schema, "auth")


const server = new ApolloServer({
  schema: schema,
  formatError: helpers.formatError,
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
  introspection: process.env.NODE_ENV === 'development',
  // context: helpers.applyMiddleware([
  //     auth.middlewares.authenticate_client(arango),
  //     auth.middlewares.authenticate_user(arango)
  // ]),
  cache: cache.memcache,
  plugins: [cache.responseCache]
})

const spotifyApiInstance = new SpotifyAPI({ cache: server.cache }, process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET, process.env.SPOTIFY_SCOPE )
spotifyApiInstance.start()

const start = async () => {
  const arangoConnection = await ArangoAPI.connect(
    `http://${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}`,
    process.env.ARANGODB_DATABASE,
    process.env.ARANGODB_USER,
    process.env.ARANGODB_PASSWORD
  )

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      // const token = getTokenFromRequest(req);

      

      return {
        dataSources: {
          spotify: spotifyApiInstance,
          arango: new ArangoAPI(arangoConnection)
        },
      };
    },
    listen: { port: Number.parseInt(port) },
  })
  console.log(`-> Server ready at ${url}`)
}

start()



