const errors = require('@out-of-tune/errors')
function handle_error(err, req, res, next) {
    if(err instanceof errors.AuthenticationError) {
        return res.status(err.status_code).json({ error: err.message, type: err.type })
    }

    next(err)
}

module.exports = handle_error