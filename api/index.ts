import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import auth from './auth';
import helpers from './helpers';

import ArangoAPI from './datasources/arangodb';
import SpotifyAPI from './datasources/spotify';

import resolvers from './resolvers';
import { readFileSync } from 'fs';
import schemaDirectives from './directives';
require('dotenv').config()

import cache from './caching';


const port = process.env.APOLLO_PORT
const type_defs = readFileSync('./schema.graphql', { encoding: 'utf-8' });;

const server = new ApolloServer({
  typeDefs: type_defs,
  formatError: helpers.formatError,
  resolvers,
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
  introspection: process.env.NODE_ENV === 'development',
  // dataSources: () => ({
  //     spotify: spotifyApiInstance,
  //     arango: arango
  // }),
  // context: helpers.applyMiddleware([
  //     auth.middlewares.authenticate_client(arango),
  //     auth.middlewares.authenticate_user(arango)
  // ]),
  cache: cache.memcache,
  plugins: [cache.responseCache]
})


const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    // const token = getTokenFromRequest(req);
    const { cache } = server;
    const spotifyApiInstance = new SpotifyAPI({ cache },process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET, process.env.SPOTIFY_SCOPE )
    spotifyApiInstance.start()

    const arango = new ArangoAPI()
    arango.connect(
      `http://${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}`,
      process.env.ARANGODB_DATABASE,
      process.env.ARANGODB_USER,
      process.env.ARANGODB_PASSWORD
    )

    return {
      dataSources: {
        spotify: spotifyApiInstance,
        arango: arango
      },
    };
  },
  listen: { port: Number.parseInt(port) },
});

console.log(`🚀 Server ready at ${url}`)

