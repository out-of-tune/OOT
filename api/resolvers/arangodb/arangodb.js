const { merge } = require('lodash')
const artist = require('./artist')
const genre = require('./genre')
const user = require('./user')
const app = require('./app')
const feedback = require('./feedback')
const resolvers = merge(
    artist,
    genre,
    user,
    app,
    feedback
)
module.exports = resolvers