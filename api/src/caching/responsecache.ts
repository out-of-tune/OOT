import responseCachePlugin from '@apollo/server-plugin-response-cache'
import cache from './memcached.js'

export default responseCachePlugin({
    sessionId: async (requestContext) => (requestContext.request.http.headers.get('Authorization') || null),
    cache
})
