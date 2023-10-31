require('dotenv').config()

module.exports = {
  PROXY_URI: process.env.VITE_PROXY_URI,
  SPOTIFY_SCOPE: process.env.SPOTIFY_SCOPE,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
}
