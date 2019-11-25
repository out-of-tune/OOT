const auth = require('@out-of-tune/auth-tools')
const asyncHandler = require('../asyncHandler')
const arango = require('../../datasources/arangodb')

async function check_auth(req, res, next) {
    await auth.middlewares.authenticate_client(arango)({req, res})
    next()
}

module.exports = asyncHandler(check_auth)