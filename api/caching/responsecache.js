const responseCachePlugin = require('apollo-server-plugin-response-cache')
const cache = require('./memcached')

module.exports = responseCachePlugin({
    sessionId: (requestContext) => (requestContext.request.http.headers.get('Authorization') || null),
    cache
})