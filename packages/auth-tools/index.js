const auth = require('./src/auth')
const middlewares = require('./src/middleware')

module.exports = {
    ...auth,
    middlewares
}