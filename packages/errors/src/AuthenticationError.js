const HttpError = require('./HttpError')

class AuthenticationError extends HttpError {
    constructor(type, ...args){
        super(401, ...args)
        this.type = type
        this.name = 'AuthenticationError'
        Error.captureStackTrace(this, AuthenticationError)
    }
}

module.exports = AuthenticationError