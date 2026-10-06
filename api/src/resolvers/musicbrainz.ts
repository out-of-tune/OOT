import type MusicBrainzAPI from "../datasources/musicbrainz/index.js";
import { MAX_IDS } from "../datasources/musicbrainz/index.js";
import { InvalidInputError } from "../errors/errors.js";

interface Context {
  dataSources: { musicbrainz: MusicBrainzAPI };
}

interface Args {
  sids: string[];
  urgent?: boolean;
}

const checked = (sids: string[]) => {
  if (sids.length > MAX_IDS) throw new InvalidInputError(`At most ${MAX_IDS} ids per query`);
  return sids;
};

const resolvers = {
  Query: {
    artistMetadata: (_parent: unknown, { sids, urgent }: Args, { dataSources }: Context) =>
      dataSources.musicbrainz.metadata("artist", checked(sids), urgent),
    albumMetadata: (_parent: unknown, { sids, urgent }: Args, { dataSources }: Context) =>
      dataSources.musicbrainz.metadata("album", checked(sids), urgent),
  },
};

export default resolvers;
