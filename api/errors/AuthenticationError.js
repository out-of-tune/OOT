const { createError } = require('apollo-errors')

const AuthenticationError = createError('AuthenticationError', {
    message: 'You must be signed in to access this ressource!',
    internalData: {
        skiplog: true
    }
})

module.exports = AuthenticationError