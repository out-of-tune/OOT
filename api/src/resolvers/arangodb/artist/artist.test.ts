import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { ApolloServer } from '@apollo/server'
import { makeExecutableSchema } from '@graphql-tools/schema'

// Random test values.
const casual = {
    integer: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    get name() { return `name-${randomUUID().slice(0, 8)}` },
    get username() { return `user-${randomUUID().slice(0, 8)}` },
    get uuid() { return randomUUID() },
    get password() { return randomUUID().replaceAll('-', '').slice(0, 12) },
}
import { InvalidInputError } from '../../../errors/errors.js'
import resolvers from './artist.js'
import { SpotifyRequestError } from '../../../datasources/spotify/index.js'

const genId = (base='Artist') => `${base}/${casual.integer(1, 200000)}`

const context = {
    dataSources: {
        arango: {
            artist: {
                byName: async (name, limit) => {
                    var a = {
                        name,
                        id: 'Artist/1',
                        popularity: 54,
                        images: ['image1.png']
                    }
                    return [a]
                },
                search: async (val, field) => {
                    var a = {
                        id: 'Artist/1',
                        sid: '445771199x',
                        mbid: 'a4df10e9-fd63-4f4a-8aa4-c6945676dc2b'
                    }
                    Object.defineProperty(a, field, { value: val, writable: false })
                    return [a]
                },
                get: async (id) => ({
                    id,
                    sid: '445771199x',
                    mbid: 'a4df10e9-fd63-4f4a-8aa4-c6945676dc2b'
                }),
                info: async (id) => ({
                    name: 'Bob D.',
                    popularity: 54,
                    images: (id === -1) ? [] : ['image1.png']
                }),
                genres: async (id) => ([
                    {
                        name: 'rock',
                        id: 'Genre/1'
                    }
                ])
            }
        }
    },
    req: {}
}

describe('artist resolvers', () => {
    test('name', async () => {
        const res = await resolvers.Artist.name({ id: genId() }, {}, context)
        expect(res).toMatch('Bob D.')
    })
    test('mbid', async () => {
        const res = await resolvers.Artist.mbid({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('string')
        expect(res).toMatch('a4df10e9-fd63-4f4a-8aa4-c6945676dc2b')
    })
    test('sid', async () => {
        const res = await resolvers.Artist.sid({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('string')
        expect(res).toMatch('445771199x')
    })
    test('popularity', async () => {
        const res = await resolvers.Artist.popularity({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('number')
        expect(res).toBe(54)
    })
    test('images', async () => {
        const res = await resolvers.Artist.images({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('object')
        expect(res.length).toBeGreaterThan(0)
        expect(res[0]).toMatch('image1.png')

        // empty-image-case
        const res2 = await resolvers.Artist.images({ id: -1 }, {}, context)
        expect(typeof(res2)).toBe('object')
        expect(res2).toHaveLength(0)
    })

    describe('parent resolver', () => {
        test('invalid argument count', async () => {
            try {
                await resolvers.Query.artist({}, {id: genId(), mbid: casual.uuid}, context)
            } catch (e) {
                if (!(e instanceof InvalidInputError)) throw e
                expect(true).toBe(true)
            }
            await resolvers.Query.artist({}, {name: casual.username, limit: 6 }, context)
            expect(true).toBe(true)
            
        })
        test('id argument', async () => {
            const id = genId()
            const res = await resolvers.Query.artist({}, { id }, context)
            expect(typeof(res)).toBe('object')
            expect(res).toHaveLength(1)
            expect(typeof(res[0])).toBe('object')
            expect(res[0].id).toMatch(id)
        })
        test('name argument', async () => {
            const name = casual.username
            const res = await resolvers.Query.artist({}, { name, limit: 5 }, context)
            expect(typeof(res)).toBe('object')
            expect(res).toHaveLength(1)
            expect(typeof(res[0])).toBe('object')
            const artist = res[0]
            expect(artist).toEqual({
                name,
                id: 'Artist/1',
                popularity: 54,
                images: ['image1.png']
            })
        })
        test('sid argument', async () => {
            const sid = casual.password
            const res = await resolvers.Query.artist({}, { sid }, context)
            expect(res).toHaveLength(1)
            expect(res[0]).toEqual({
                id: 'Artist/1',
                sid,
                mbid: 'a4df10e9-fd63-4f4a-8aa4-c6945676dc2b'
            })
        })
        test('mbid argument', async () => {
            const mbid = casual.uuid
            const res = await resolvers.Query.artist({}, { mbid }, context)
            expect(res).toHaveLength(1)

            expect(res[0]).toEqual({
                id: 'Artist/1',
                sid: '445771199x',
                mbid
            })
        })
    })
})

describe('unknown artist by sid', () => {
    const makeContext = (artistInfo) => {
        const created: string[] = []
        return {
            created,
            context: {
                dataSources: {
                    spotify: { artist_info: artistInfo },
                    arango: {
                        artist: {
                            search: async () => [],
                            create: async ({ sid }) => { created.push(sid); return { id: 'Artist/99', sid } },
                            createInfo: async () => ({}),
                            linkGenres: async () => [],
                        },
                    },
                },
            },
        }
    }

    test('loads the artist from Spotify without an HTTP round trip', async () => {
        const { context, created } = makeContext(async () => ({ name: 'New', genres: ['rock'], popularity: 1, images: [] }))
        const res = await resolvers.Query.artist({}, { sid: 'abc"def' }, context)
        expect(res).toEqual([{ id: 'Artist/99', sid: 'abc"def' }])
        expect(created).toEqual(['abc"def'])
    })

    test('returns no artist when Spotify rejects the id', async () => {
        const { context } = makeContext(async () => { throw new SpotifyRequestError(400, 'invalid id') })
        expect(await resolvers.Query.artist({}, { sid: 'bad' }, context)).toEqual([])
        expect(await resolvers.Mutation.addArtist({}, { sid: 'bad' }, context)).toEqual({ success: false, message: 'invalid id' })
    })

    test('does not let the response cache keep the empty result', async () => {
        const { context } = makeContext(async () => { throw new SpotifyRequestError(503, 'unavailable') })
        const typeDefs = readFileSync(new URL('../../../../schema/schema.graphql', import.meta.url), 'utf-8')
        const server = new ApolloServer({ schema: makeExecutableSchema({ typeDefs, resolvers: { Query: resolvers.Query } }) })
        const response = await server.executeOperation({ query: '{ artist(sid: "abc") { name } }' }, { contextValue: context })
        expect(response.body.kind === 'single' && response.body.singleResult.data).toEqual({ artist: [] })
        expect(response.http.headers.get('cache-control')).toBe('no-store')
    })
})
