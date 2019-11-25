const { createError } = require('apollo-errors')

const NotFoundError = createError('NotFoundError', {
    message: 'The id was not found.',
    internalData: {
        skiplog: true
    }
})

module.exports = NotFoundError