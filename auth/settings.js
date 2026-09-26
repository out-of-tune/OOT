require('dotenv').config({ quiet: true })

const PROXY_URI = process.env.VITE_PROXY_URI ?? 'http://localhost'

module.exports = {
  PORT: Number(process.env.AUTH_PORT ?? 4000),
  PROXY_URI,
  /** Pages that may call the auth routes with their cookies: the app itself plus AUTH_CORS_ORIGINS. */
  CORS_ORIGINS: [PROXY_URI, ...(process.env.AUTH_CORS_ORIGINS ?? '').split(/[\s,]+/).filter(Boolean)]
    .map(uri => new URL(uri).origin),
  SPOTIFY_SCOPE: process.env.SPOTIFY_SCOPE,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
}
