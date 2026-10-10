import { InvalidInputError } from "../../../errors/errors.js"

type GnereQuery = {
    id?: string,
    name?: string,
    limit?: number
}

const resolvers = {
    Query: {
        genre: (_, { id, name, limit }: GnereQuery, {dataSources }) => {
            const filters = {id, name}
            if (Object.values(filters).filter(val => val).length > 1)
                throw new InvalidInputError('Set at most one of id and name.', {
                    location: 'genre',
                    input: filters,
                })

            if (id) return [{ id }]
            if (name) return dataSources.arango.genre.byName(name, limit)
            return dataSources.arango.genre.all()
        }
    },
    Genre: {
        name: async ({ id }, _, { dataSources }) => (await dataSources.arango.genre.get(id)).name,
        artists: async ({ id }, _, { dataSources }) => dataSources.arango.genre.artists(id),
        subgenres: async ({ id }, _, { dataSources }) => dataSources.arango.genre.subgenres(id),
        supergenres: async ({ id }, _, { dataSources }) => dataSources.arango.genre.supergenres(id)
    }
}

export default resolvers
