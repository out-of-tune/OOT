const smallArtistCase = {
    id: 'small artist',
    query: `
        query {
            artist (id:"1234") {
                name
                id
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: { artist: [{ name: 'Bob D.', id: 'Artist/1' }, { name: 'Bob D.', id: 'Artist/1' }] } }
};
const fullArtist = {
    name: 'Bob D.',
    id: 'Artist/1',
    sid: '0001',
    mbid: '1000',
    images: [],
    popularity: 12,
    genres: [{
            name: 'rock',
            id: 'Genre/1'
        }]
};
const fullArtistCase = {
    id: 'full artist',
    query: `
        query {
            artist (id:"1234") {
                name
                id
                sid
                mbid
                images
                popularity
                genres {
                    name
                    id
                }
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: { artist: [fullArtist, fullArtist] } }
};
export default [
    smallArtistCase,
    fullArtistCase
];
