const { createError } = require('apollo-errors')

const InvalidInputError = createError('InvalidInputError', {
    message: 'The input for the enpoint was invalid.',
    internalData: {
        skiplog: true
    }
})

module.exports = InvalidInputError