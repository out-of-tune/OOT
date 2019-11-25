const { MemcachedCache } = require('apollo-server-cache-memcached')

module.exports = new MemcachedCache(
    [ process.env.MEMCACHED_HOST],
    { retries: 10, retry: 1000 }
)