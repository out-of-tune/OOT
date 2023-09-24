import casual from 'casual'
import { InvalidInputError } from '../../../errors/errors.js'
import resolvers from './genre.js'

const genId = (base='Genre') => `${base}/${casual.integer(1, 200000)}`

const genre = {
    id: 'Genre/1',
    name: 'rock'
}

const context = {
    dataSources: {
        arango: {
            genre: { // need to change to concrete data for testing
                byName: async (name, limit) => ([{
                    ...genre,
                    name
                }]),
                all: async () => ([genre, genre]),
                get: async (id) => ({
                    ...genre,
                    id
                }),
                subgenres: async (id) => ([genre]),
                supergenres: async (id) => ([genre]),
                artists: async (id) => ([{
                    id: 'Artist/2',
                    sid: '77345gg',
                    mbid: '',
                }])
            }
        }
    }
}

describe('genre resolvers', () => {
    test('name', async () => {
        const res = await resolvers.Genre.name({ id: genId() }, {}, context)
        expect(res).toMatch('rock')
    })
    test('artists', async () => {
        const res = await resolvers.Genre.artists({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('object')
        expect(res).toHaveLength(1)
        expect(res[0]).toMatchObject({
            id: 'Artist/2',
            sid: '77345gg',
            mbid: ''
        })
    })
    test('subgenres', async () => {
        const res = await resolvers.Genre.subgenres({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('object')
        expect(res).toHaveLength(1)
        expect(res[0]).toMatchObject({
            id: 'Genre/1',
            name: 'rock'
        })
    })
    test('supergenres', async () => {
        const res = await resolvers.Genre.supergenres({ id: genId() }, {}, context)
        expect(typeof(res)).toBe('object')
        expect(res).toHaveLength(1)
        expect(res[0]).toMatchObject({
            id: 'Genre/1',
            name: 'rock'
        })
    })

    describe('parent resolver', () => {
        test('invalid argument count', async () => {
            try {
                await resolvers.Query.genre({}, {id: genId(), name: casual.name}, context)
            } catch (e) {
                if (!(e instanceof InvalidInputError)) throw e
                expect(true).toBe(true)
            }
            await resolvers.Query.genre({}, {name: casual.name, limit: 6 }, context)
            expect(true).toBe(true)
            
        })
        test('id argument', async () => {
            const id = genId()
            const res = await resolvers.Query.genre({}, { id }, context)
            expect(typeof(res)).toBe('object')
            expect(res).toHaveLength(1)
            expect(typeof(res[0])).toBe('object')
            expect(res[0].id).toMatch(id)
        })
        test('name argument', async () => {
            const name = casual.name
            const res = await resolvers.Query.genre({}, { name, limit: 5 }, context)
            expect(typeof(res)).toBe('object')
            expect(res).toHaveLength(1)
            expect(typeof(res[0])).toBe('object')
            const genre = res[0]
            expect(genre).toEqual({
                name,
                id: 'Genre/1'
            })
        })
    })
})
