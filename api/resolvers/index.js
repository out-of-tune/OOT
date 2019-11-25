const { merge } = require('lodash')
const arangodb = require('./arangodb')
const spotify = require('./spotify')
const resolvers = merge(
    arangodb,
    spotify
)
module.exports = resolvers