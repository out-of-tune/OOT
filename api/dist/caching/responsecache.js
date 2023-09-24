import responseCachePlugin from 'apollo-server-plugin-response-cache';
import cache from './memcached';
export default responseCachePlugin({
    sessionId: (requestContext) => (requestContext.request.http.headers.get('Authorization') || null),
    cache
});
