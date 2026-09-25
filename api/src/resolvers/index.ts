import arangodb from "./arangodb/arangodb.js";
import { mergeResolvers } from "./merge.js";
import spotify from "./spotify.js";

const resolvers = mergeResolvers(arangodb, spotify);

export default resolvers;
