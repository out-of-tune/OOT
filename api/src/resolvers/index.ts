import arangodb from "./arangodb/arangodb.js";
import { mergeResolvers } from "./merge.js";
import musicbrainz from "./musicbrainz.js";
import spotify from "./spotify.js";

const resolvers = mergeResolvers(arangodb, spotify, musicbrainz);

export default resolvers;
