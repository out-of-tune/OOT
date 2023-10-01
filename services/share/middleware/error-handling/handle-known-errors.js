import { AuthenticationError } from '@out-of-tune/errors'

function handle_error(err, req, res, next) {
    if(err instanceof AuthenticationError) {
        return res.status(err.status_code).json({ error: err.message, type: err.type })
    }

    next(err)
}

export default handle_error