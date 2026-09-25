import responseCachePlugin from "@apollo/server-plugin-response-cache";

/** Caches whole responses. Requests with an Authorization header get a private cache entry. */
export default responseCachePlugin({
  sessionId: async (requestContext) => requestContext.request.http?.headers.get("authorization") ?? null,
});
