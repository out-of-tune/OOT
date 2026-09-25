require('dotenv').config({ quiet: true })

module.exports = {
  PORT: Number(process.env.AUTH_PORT ?? 4000),
  PROXY_URI: process.env.VITE_PROXY_URI ?? 'http://localhost',
  SPOTIFY_SCOPE: process.env.SPOTIFY_SCOPE,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
}
