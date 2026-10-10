import { mergeResolvers } from "../merge.js";
import artist from "./artist/artist.js";
import feedback from "./feedback/feedback.js";
import genre from "./genre/genre.js";

const resolvers = mergeResolvers(artist, genre, feedback);

export default resolvers;
