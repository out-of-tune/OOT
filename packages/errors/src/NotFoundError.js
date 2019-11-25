const HttpError = require('./HttpError')

class NotFoundError extends HttpError {
    constructor(...args){
        super(404, ...args)
        Error.captureStackTrace(this, NotFoundError)
    }
}

module.exports = NotFoundError