import dotenv from 'dotenv'
dotenv.config()

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import helpers from './helpers/index.js';

import ArangoAPI from './datasources/arangodb/index.js';
import SpotifyAPI from './datasources/spotify/index.js';

import resolvers from './resolvers/index.js';
import { readFileSync } from 'fs';

import cache from './caching/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';


const port = process.env.APOLLO_PORT
const type_defs = readFileSync('./schema/schema.graphql', { encoding: 'utf-8' });;

let schema = makeExecutableSchema({
    typeDefs: type_defs,
    resolvers
})

const server = new ApolloServer({
  schema: schema,
  formatError: helpers.formatError,
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
  introspection: process.env.NODE_ENV === 'development',
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
    context: async () => {
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



