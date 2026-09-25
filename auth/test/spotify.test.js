const { after, before, describe, it } = require('node:test')
const assert = require('node:assert/strict')

process.env.VITE_PROXY_URI = 'http://oot.test'
process.env.SPOTIFY_CLIENT_ID = 'client-id'
process.env.SPOTIFY_CLIENT_SECRET = 'client-secret'
process.env.SPOTIFY_SCOPE = 'user-read-private'

const app = require('../app')

let server
let base

before(async () => {
    server = app.listen(0)
    await new Promise(resolve => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}/oauth2/spotify`
})

after(() => server.close())

describe('Spotify login', () => {
    it('returns the authorize URL with a state that matches the cookie', async () => {
        const response = await fetch(`${base}/`)
        const url = new URL(await response.text())
        const cookie = response.headers.get('set-cookie')
        assert.equal(url.origin, 'https://accounts.spotify.com')
        assert.equal(url.searchParams.get('redirect_uri'), 'http://oot.test/auth/oauth2/spotify/callback')
        const state = url.searchParams.get('state')
        assert.match(state, /^[0-9a-f]{32}$/)
        assert.match(cookie, new RegExp(`oot_oauth_state=${state}`))
        assert.match(cookie, /HttpOnly/)
    })

    it('rejects a callback without the state cookie', async () => {
        const response = await fetch(`${base}/callback?code=abc&state=forged`, { redirect: 'manual' })
        assert.equal(response.status, 302)
        assert.equal(response.headers.get('location'), 'http://oot.test/#/login?error=invalid_state')
    })

    it('passes a Spotify error to the client', async () => {
        const response = await fetch(`${base}/callback?error=access_denied`, { redirect: 'manual' })
        assert.equal(response.headers.get('location'), 'http://oot.test/#/login?error=access_denied')
    })

    it('rejects a refresh without a token', async () => {
        const response = await fetch(`${base}/refresh`)
        assert.equal(response.status, 400)
    })
})
