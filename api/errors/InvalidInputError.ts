import { createError } from 'apollo-errors'

const InvalidInputError = createError('InvalidInputError', {
    message: 'The input for the enpoint was invalid.',
    internalData: {
        skiplog: true
    }
})

export default InvalidInputError
