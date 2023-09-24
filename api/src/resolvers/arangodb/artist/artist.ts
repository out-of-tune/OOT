import got from 'got'
import { InvalidInputError } from '../../../errors/errors.js'
import { API_PORT } from '../../../helpers/settings.js'

type ArtistQuery = {
    id?: string,
    sid?: string,
    mbid?: string,
    name?: string,
    limit?: number
}

const resolvers = {
    Query: {
        artist: async (_, { id, sid, mbid, name, limit }: ArtistQuery, { dataSources, req }) => {
            const filters = {id, sid, mbid, name}
            if (Object.values(filters).filter(val => val).length !== 1)
                throw new InvalidInputError({
                    data: {
                        location: 'artist',
                        input: filters,
                        unexpected: 'One field is expected to be set. Multiple fields are ambiguous.'
                    }
                })
            if (id) return [{ id }]
            if (sid) {
                const res = await dataSources.arango.artist.search(sid, 'sid')
                if (res.length !== 0) return res
                try {
                    const added: any = await got.post(`http://localhost:${API_PORT}/`, {
                        json: {
                            query: `
                                mutation {
                                    addArtist(sid: "${sid}") {
                                        artist {
                                            id
                                            sid
                                        }
                                        success
                                    }
                                }
                            `
                        },
                        headers: {
                            'client-authentication': req.headers['client-authentication']
                        }
                    }).json()
                    if (added.data.addArtist.success) {
                        return [ added.data.addArtist.artist ]
                    }
                }
                catch (err) {
                    console.log(err)
                }
                
                return []
            }
            if (mbid) return dataSources.arango.artist.search(mbid, 'mbid')
            if (name) return dataSources.arango.artist.byName(name, limit)
            return []
        }
    },
    Artist: {
        mbid: async ({ id }, _, { dataSources }) => (await dataSources.arango.artist.get(id)).mbid,
        sid: async ({ id }, _, { dataSources }) => (await dataSources.arango.artist.get(id)).sid,
        name: async ({ id }, _, { dataSources }) => (await dataSources.arango.artist.info(id)).name,
        popularity: async ({ id }, _, { dataSources }) => (await dataSources.arango.artist.info(id)).popularity,
        images: async ({ id }, _, { dataSources }) => (await dataSources.arango.artist.info(id)).images,
        genres: async ({ id }, _, { dataSources }) => dataSources.arango.artist.genres(id)
    },
    Mutation: {
        addArtist: async (_, { sid }, { dataSources }) => {
            if ((await dataSources.arango.artist.search(sid, 'sid')).length !== 0) return {
                success: false,
                message: 'id already exists in db'
            }

            try {
                const { genres, ...info} = await dataSources.spotify.artist_info(sid)
                const artist = await dataSources.arango.artist.create({ sid, mbid: '' })
                const info_ = await dataSources.arango.artist.createInfo(info, artist.id)
                dataSources.arango.artist.linkGenres(artist.id, genres)
                
                return {
                    success: true,
                    message: 'added artist successfully',
                    artist: {
                        id: artist.id,
                        sid
                    }
                }
            } catch(err) {
                return {
                    success: false,
                    message: (err.message == "400 - \"{\\n  \\\"error\\\" : {\\n    \\\"status\\\" : 400,\\n    \\\"message\\\" : \\\"invalid id\\\"\\n  }\\n}\"")
                        ? 'invalid id'
                        : err.message
                }
            }
        }
    }
}

export default resolvers
