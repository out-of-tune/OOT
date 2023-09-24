const user = {
    id: 'User/1',
    email: 'steve@minecraft.com',
    firstname: 'Steve',
    lastname: null,
    name: 'Steve'
}

const userCase = {
    id: 'retrieve user',
    query: `
        query {
            user(id:"User/1") {
                email
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: { user: [{email: user.email}, {email: user.email}]}}
}

const wholeUserCase = {
    id: 'retreive whole user',
    query: `
        query {
            user(id:"User/1") {
                id
                email
                firstname
                lastname
                name
            }
        }
    `,
    variables: {},
    context: {},
    expected: { data: { user: [user, user]}}
}

export default [
    userCase,
    wholeUserCase
]
