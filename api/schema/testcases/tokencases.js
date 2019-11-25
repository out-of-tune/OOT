const tokenCase = {
    id: 'public token',
    query: `
        query {
            publicToken {
                token
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: { publicToken: { token: 'ACCESS-TOKEN' }}}
}

module.exports = [
    tokenCase
]