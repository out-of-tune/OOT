import { MemcachedCache } from 'apollo-server-cache-memcached';
export default new MemcachedCache([process.env.MEMCACHED_HOST], { retries: 10, retry: 1000 });
