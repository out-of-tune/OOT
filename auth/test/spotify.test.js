const { after, before, describe, it } = require('node:test')
const assert = require('node:assert/strict')

process.env.VITE_PROXY_URI = 'http://oot.test'
process.env.SPOTIFY_CLIENT_ID = 'client-id'
process.env.SPOTIFY_CLIENT_SECRET = 'client-secret'
process.env.SPOTIFY_SCOPE = 'user-read-private'

// The Spotify token endpoint is replaced, so the tests need no network and no account.
const { AuthorizationCode } = require('simple-oauth2')
AuthorizationCode.prototype.getToken = async () => ({
    token: { access_token: 'access-1', refresh_token: 'refresh-1', expires_in: 3600 }
})
AuthorizationCode.prototype.createToken = function (token) {
    return {
        refresh: async () => {
            if (token.refresh_token === 'refresh-down') {
                throw Object.assign(new Error('Response Error: 503'), { data: { payload: 'Service Unavailable' } })
            }
            if (token.refresh_token !== 'refresh-1') {
                throw Object.assign(new Error('Response Error: 400'), { data: { payload: { error: 'invalid_grant' } } })
            }
            return { token: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 3600, scope: 'streaming' } }
        }
    }
}

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

    it('rejects a refresh without the cookie', async () => {
        const response = await fetch(`${base}/refresh`)
        assert.equal(response.status, 401)
    })

    it('keeps the refresh token in an httpOnly cookie and not in the URL', async () => {
        const login = await fetch(`${base}/`)
        const stateCookie = login.headers.get('set-cookie').split(';')[0]
        const state = new URL(await login.text()).searchParams.get('state')
        const response = await fetch(`${base}/callback?code=abc&state=${state}`, {
            redirect: 'manual',
            headers: { cookie: stateCookie }
        })
        assert.equal(response.headers.get('location'), 'http://oot.test/#/login?status=success')
        const cookies = response.headers.getSetCookie().join('\n')
        assert.match(cookies, /oot_refresh=refresh-1;[^\n]*HttpOnly/)
    })

    it('returns an access token for the cookie and stores the rotated refresh token', async () => {
        const response = await fetch(`${base}/refresh`, { headers: { cookie: 'oot_refresh=refresh-1' } })
        assert.equal(response.status, 200)
        assert.deepEqual(await response.json(), { access_token: 'access-2', expires_in: 3600, scope: 'streaming' })
        assert.match(response.headers.getSetCookie().join('\n'), /oot_refresh=refresh-2/)
    })

    it('forgets an invalid refresh token', async () => {
        const response = await fetch(`${base}/refresh`, { headers: { cookie: 'oot_refresh=expired' } })
        assert.equal(response.status, 401)
        assert.match(response.headers.getSetCookie().join('\n'), /oot_refresh=;/)
    })

    it('keeps the session when Spotify is unavailable', async () => {
        const response = await fetch(`${base}/refresh`, { headers: { cookie: 'oot_refresh=refresh-down' } })
        assert.equal(response.status, 503)
        assert.doesNotMatch(response.headers.getSetCookie().join('\n'), /oot_refresh=;/)
    })

    it('ignores a malformed cookie', async () => {
        const response = await fetch(`${base}/refresh`, { headers: { cookie: 'oot_refresh=%E0%A4%A' } })
        assert.equal(response.status, 401)
    })

    it('scopes the cookies to the path prefix of the app', () => {
        const { cookiePath } = require('../routes/oauth2/spotify')
        assert.equal(cookiePath('http://oot.test'), '/auth/oauth2/spotify')
        assert.equal(cookiePath('https://d.out-of-tune.org/app'), '/app/auth/oauth2/spotify')
        assert.equal(cookiePath('https://d.out-of-tune.org/app/'), '/app/auth/oauth2/spotify')
    })

    it('logs out by deleting the cookie', async () => {
        const response = await fetch(`${base}/logout`, { method: 'POST' })
        assert.equal(response.status, 204)
        assert.match(response.headers.getSetCookie().join('\n'), /oot_refresh=;/)
    })
})
