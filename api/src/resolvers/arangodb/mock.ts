var casual = require('casual')
import resolvers from './arangodb.js'

casual.define('array', (min, max) => {
    var arr = []
    for (var i = min; i <= max; i++ ) arr.push('')
    return arr
})

casual.define('id', (base) => {
    return `${base}/${casual.integer(1, 200000)}`
})

casual.define('genre', (id) => ({
    name: casual.name,
    id: id || casual.id('Genre')
}))

casual.define('artist', (id) => ({
    sid: casual.password,
    mbid: casual.uuid,
    id: id || casual.id('Artist')
}))

casual.define('genres', (max) => {
    return casual.array(0, max || 3).map(() => casual.genre)
})

casual.define('artists', (max) => {
    return casual.array(0, max || 10).map(() => casual.artist)
})

casual.define('info', () => ({
    name: casual.username,
    popularity: casual.integer(1, 200),
    images: casual.array(0, 3).map(() => casual.url)
}))

const mock_arango = {
    artist: {
        byName: async (name, limit) => casual.array(limit, limit).map(() => ({
            name,
            ...casual.artist
        })),
        search: async (val, field) => casual.artists.map((a) => {
            Object.defineProperty(a, field, { value: val, writable: false })
            return a
        }),
        get: async (id) => casual.artist(id),
        info: async (id) => casual.info,
        genres: async (id) => casual.genres
    },
    genre: {
        byName: async (name, limit) => casual.array(limit, limit).map(() => ({
            name,
            ...casual.genre
        })),
        all: async () => casual.genres(30),
        get: async (id) => casual.genre(id),
        subgenres: async (id) => casual.genres,
        supergenres: async (id) => casual.genres,
        artists: async (id) => casual.artists
    }
}

export default mock_arango
