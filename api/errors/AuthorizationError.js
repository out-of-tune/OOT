const { createError } = require('apollo-errors')

const AuthorizationError = createError('AuthorizationError', {
    message: "You are not authorized to access this resource.",
    internalData: {
        skiplog: true
    }
})

module.exports = AuthorizationError