import { createError } from 'apollo-errors'

export const InvalidInputError = createError('InvalidInputError', {
    message: 'The input for the enpoint was invalid.',
    internalData: {
        skiplog: true
    }
})
