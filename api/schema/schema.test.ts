import { makeExecutableSchema, addMockFunctionsToSchema, mockServer, MockList } from 'graphql-tools'

import { graphql } from 'graphql'

import testcases from './testcases'
import { readFileSync } from 'fs';

const type_defs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

describe('Schema', () => {
    const mockSchema = makeExecutableSchema({ typeDefs })

    // Here we specify the return payloads of mocked types
    addMockFunctionsToSchema({
        schema: mockSchema,
        mocks: {
            Genre: () => ({
                id: 'Genre/1',
                name: 'rock',
                artists: () => new MockList(5),
                subgenres: () => new MockList(1),
                supergenres: () => new MockList(1)
            }),
            Token: () => ({
                token: 'ACCESS-TOKEN'
            }),
            Artist: () => ({
                id: 'Artist/1',
                name: 'Bob D.',
                sid: '0001',
                mbid: '1000',
                images: [],
                popularity: 12,
                genres: () => new MockList(1)
            }),
            User: () => ({
                id: 'User/1',
                email: 'steve@minecraft.com',
                firstname: 'Steve',
                lastname: null,
                name: 'Steve'
            })
        }
    })

    test('has valid type definitions', async () => {
        expect(async () => {
        const MockServer = mockServer(typeDefs)

        await MockServer.query(`{ __schema { types { name } } }`)
        }).not.toThrow()
    })

    testcases.forEach(obj => {
        const { id, query, variables, context: ctx, expected } = obj

        test(`query: ${id}`, async () => {
            return await expect(
                graphql(mockSchema, query, null, { ctx }, variables)
            ).resolves.toEqual(expected)
        })
    })

})
