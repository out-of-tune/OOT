const auth = require('./auth')
const middlewares = require('./middleware')

module.exports = {
    ...auth,
    middlewares
}