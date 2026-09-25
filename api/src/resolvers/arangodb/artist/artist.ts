import { InvalidInputError } from "../../../errors/errors.js";
import { SpotifyRequestError } from "../../../datasources/spotify/index.js";

type ArtistQuery = {
  id?: string;
  sid?: string;
  mbid?: string;
  name?: string;
  limit?: number;
};

/**
 * Loads an artist from Spotify and saves it with its genres.
 * Returns the same result as the `addArtist` mutation.
 */
export async function addArtist(sid: string, dataSources) {
  if ((await dataSources.arango.artist.search(sid, "sid")).length !== 0) {
    return { success: false, message: "id already exists in db" };
  }
  try {
    const { genres, ...info } = await dataSources.spotify.artist_info(sid);
    const artist = await dataSources.arango.artist.create({ sid, mbid: "" });
    await dataSources.arango.artist.createInfo(info, artist.id);
    await dataSources.arango.artist.linkGenres(artist.id, genres);
    return {
      success: true,
      message: "added artist successfully",
      artist: { id: artist.id, sid },
    };
  } catch (error) {
    const invalidId = error instanceof SpotifyRequestError && error.status === 400;
    return { success: false, message: invalidId ? "invalid id" : (error as Error).message };
  }
}

const resolvers = {
  Query: {
    artist: async (_parent: unknown, { id, sid, mbid, name, limit }: ArtistQuery, { dataSources }) => {
      const filters = { id, sid, mbid, name };
      if (Object.values(filters).filter((value) => value).length !== 1) {
        throw new InvalidInputError("Set exactly one of id, sid, mbid and name.", {
          location: "artist",
          input: filters,
        });
      }
      if (id) return [{ id }];
      if (sid) {
        const found = await dataSources.arango.artist.search(sid, "sid");
        if (found.length !== 0) return found;
        // Unknown artists are loaded from Spotify on first request.
        const added = await addArtist(sid, dataSources);
        if (!added.success) console.log(`Could not add artist ${sid}: ${added.message}`);
        return added.success ? [added.artist] : [];
      }
      if (mbid) return dataSources.arango.artist.search(mbid, "mbid");
      if (name) return dataSources.arango.artist.byName(name, limit);
      return [];
    },
  },
  Artist: {
    mbid: async ({ id }, _args: unknown, { dataSources }) => (await dataSources.arango.artist.get(id)).mbid,
    sid: async ({ id }, _args: unknown, { dataSources }) => (await dataSources.arango.artist.get(id)).sid,
    name: async ({ id }, _args: unknown, { dataSources }) => (await dataSources.arango.artist.info(id)).name,
    popularity: async ({ id }, _args: unknown, { dataSources }) =>
      (await dataSources.arango.artist.info(id)).popularity,
    images: async ({ id }, _args: unknown, { dataSources }) => (await dataSources.arango.artist.info(id)).images,
    genres: async ({ id }, _args: unknown, { dataSources }) => dataSources.arango.artist.genres(id),
  },
  Mutation: {
    addArtist: (_parent: unknown, { sid }: { sid: string }, { dataSources }) => addArtist(sid, dataSources),
  },
};

export default resolvers;
