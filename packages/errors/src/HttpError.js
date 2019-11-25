const BaseError = require('./BaseError')

class HttpError extends BaseError {
    constructor(code, ...args) {
        super(...args)
        this.status_code = code
        Error.captureStackTrace(this, HttpError)
    }
}

module.exports = HttpError