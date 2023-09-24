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
    expected: { data: { publicToken: { token: 'ACCESS-TOKEN' } } }
};
export default [
    tokenCase
];
