import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import helpers from './helpers/index.js';

import ArangoAPI from './datasources/arangodb/index.js';
import SpotifyAPI from './datasources/spotify/index.js';

import resolvers from './resolvers/index.js';
import { readFileSync } from 'fs';

import cache from './caching/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as settings from './helpers/settings.js';


const type_defs = readFileSync('./schema/schema.graphql', { encoding: 'utf-8' });;

let schema = makeExecutableSchema({
    typeDefs: type_defs,
    resolvers
})

const server = new ApolloServer({
  schema: schema,
  formatError: helpers.formatError,
  includeStacktraceInErrorResponses: settings.isDev,
  introspection: settings.isDev,
  cache: cache.memcache,
  plugins: [cache.responseCache]
})

const spotifyApiInstance = new SpotifyAPI(
  { cache: server.cache }, 
  settings.SPOTIFY_CLIENT_ID, 
  settings.SPOTIFY_CLIENT_SECRET, 
  settings.SPOTIFY_SCOPE
)
spotifyApiInstance.start()

const start = async () => {
  const arangoConnection = await ArangoAPI.connect(
    `http://${settings.ARANGO_HOST}:${settings.ARANGO_PORT}`,
    settings.ARANGO_DB,
    settings.ARANGO_USER,
    settings.getArangoPassword()
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
    listen: { port: settings.API_PORT },
  })
  console.log(`-> Server ready at ${url}`)
}

start()



