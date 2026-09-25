import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import cache from "./caching/index.js";
import ArangoAPI from "./datasources/arangodb/index.js";
import SpotifyAPI from "./datasources/spotify/index.js";
import helpers from "./helpers/index.js";
import * as settings from "./helpers/settings.js";
import resolvers from "./resolvers/index.js";

const typeDefs = readFileSync(new URL("../schema/schema.graphql", import.meta.url), "utf-8");

const server = new ApolloServer({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
  formatError: helpers.formatError,
  includeStacktraceInErrorResponses: settings.isDev,
  introspection: settings.isDev,
  cache: cache.memcache,
  plugins: [cache.responseCache],
});

const spotify = new SpotifyAPI(settings.SPOTIFY_CLIENT_ID, settings.SPOTIFY_CLIENT_SECRET);
spotify.start();

const db = await ArangoAPI.connect(
  `http://${settings.ARANGO_HOST}:${settings.ARANGO_PORT}`,
  settings.ARANGO_DB,
  settings.ARANGO_USER,
  settings.getArangoPassword(),
);

const { url } = await startStandaloneServer(server, {
  context: async () => ({
    dataSources: {
      spotify,
      arango: new ArangoAPI(db),
    },
  }),
  listen: { port: settings.API_PORT },
});
console.log(`-> Server ready at ${url}`);
