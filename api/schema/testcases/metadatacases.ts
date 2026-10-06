const metadata = {
    sid: 'SPOTIFY-ID',
    status: 'FOUND',
    rating: 4.5,
    genres: [{ name: 'idm', count: 7 }],
}

const query = (field: string) => `
    query {
        ${field}(sids: ["SPOTIFY-ID"], urgent: true) {
            sid
            status
            rating
            genres { name count }
        }
    }
`

export default [
    {
        id: 'artist metadata',
        query: query('artistMetadata'),
        variables: {},
        context: {},
        expected: { data: { artistMetadata: [metadata, metadata] } },
    },
    {
        id: 'album metadata',
        query: query('albumMetadata'),
        variables: {},
        context: {},
        expected: { data: { albumMetadata: [metadata, metadata] } },
    },
]
