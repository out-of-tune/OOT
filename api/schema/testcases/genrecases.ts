const artist = {
    name: 'Bob D.'
}
const artists = [artist, artist, artist, artist, artist]
const genre = {
    name: 'rock',
    id: 'Genre/1'
}
const fullGenre = {
    ...genre,
    artists,
    subgenres: [genre],
    supergenres: [genre]
}

const smallGenreCase = {
    id: 'small genre',
    query: `
        query {
            genre (id:"1234") {
                name
                id
            }
        }
    `,
    variables: { },
    context: { },
    expected: { data: { genre: [genre, genre] } }
}

const fullGenreCase = {
    id: 'full genre',
    query: `
        query {
            genre (id:"1234") {
                name
                id
                artists {
                    name
                }
                subgenres {
                    id
                    name
                }
                supergenres {
                    id
                    name
                }
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: {
        genre: [fullGenre, fullGenre]
    }}
}

export default [
    smallGenreCase,
    fullGenreCase
]
