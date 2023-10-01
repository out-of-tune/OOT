import { Config } from '@out-of-tune/settings';
Config.load([Config.apollo, Config.arangodb, Config.spotify, Config.general])

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import helpers from './helpers/index.js';

import ArangoAPI from './datasources/arangodb/index.js';
import SpotifyAPI from './datasources/spotify/index.js';

import resolvers from './resolvers/index.js';
import { readFileSync } from 'fs';

import cache from './caching/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';


const type_defs = readFileSync('./schema/schema.graphql', { encoding: 'utf-8' });;

let schema = makeExecutableSchema({
    typeDefs: type_defs,
    resolvers
})

const server = new ApolloServer({
  schema: schema,
  formatError: helpers.formatError,
  includeStacktraceInErrorResponses: Config.general.isDev(),
  introspection: Config.general.isDev(),
  cache: cache.memcache,
  plugins: [cache.responseCache]
})

const spotifyApiInstance = new SpotifyAPI(
  { cache: server.cache }, 
  Config.spotify.clientId, 
  Config.spotify.clientSecret
)
spotifyApiInstance.start()

const start = async () => {
  const arangoConnection = await ArangoAPI.connect(
    `http://${Config.arangodb.host}:${Config.arangodb.port}`,
    Config.arangodb.database,
    Config.arangodb.user,
    Config.arangodb.password
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
    listen: { port: Config.apollo.port },
  })
  console.log(`-> Server ready at ${url}`)
}

start()



