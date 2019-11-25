const handleKnownErrors = require('./handle-known-errors')
const handleUnknownErrors = require('./handle-unknown-errors')

module.exports = [
    handleKnownErrors,
    handleUnknownErrors
]