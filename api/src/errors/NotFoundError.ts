import { createError } from 'apollo-errors'

export const NotFoundError = createError('NotFoundError', {
    message: 'The id was not found.',
    internalData: {
        skiplog: true
    }
})
