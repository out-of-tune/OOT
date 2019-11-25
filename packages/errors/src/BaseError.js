class BaseError extends Error {
    constructor(...args) {
        super(...args)
        Error.captureStackTrace(this, BaseError)
    }
}

module.exports = BaseError