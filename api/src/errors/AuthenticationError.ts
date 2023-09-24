import { createError } from 'apollo-errors'

export const AuthenticationError = createError('AuthenticationError', {
    message: 'You must be signed in to access this ressource!',
    internalData: {
        skiplog: true
    }
})

