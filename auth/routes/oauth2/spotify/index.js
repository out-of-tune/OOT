const crypto = require('node:crypto')
const express = require('express')
const { AuthorizationCode } = require('simple-oauth2')
const settings = require('../../../settings')

const router = express.Router()

const callbackUrl = `${settings.PROXY_URI}/auth/oauth2/spotify/callback`
const STATE_COOKIE = 'oot_oauth_state'
/** How long a login may take, in seconds. */
const STATE_MAX_AGE = 600
/** The refresh token lives in this httpOnly cookie, so page scripts cannot read it. */
const REFRESH_COOKIE = 'oot_refresh'
/** How long a login is remembered, in seconds. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30
const COOKIE_PATH = '/auth/oauth2/spotify'

const cookieOptions = maxAge => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: settings.PROXY_URI.startsWith('https://'),
    maxAge: maxAge * 1000,
    path: COOKIE_PATH
})

const spotifyOAuth = new AuthorizationCode({
    client: {
        id: settings.SPOTIFY_CLIENT_ID,
        secret: settings.SPOTIFY_CLIENT_SECRET
    },
    auth: {
        tokenHost: 'https://accounts.spotify.com',
        tokenPath: '/api/token',
        authorizePath: '/authorize'
    },
    options: {
        authorizationMethod: 'body'
    }
})

function readCookie(req, name) {
    const header = req.headers.cookie ?? ''
    for (const part of header.split(';')) {
        const [key, ...value] = part.trim().split('=')
        if (key === name) return decodeURIComponent(value.join('='))
    }
    return undefined
}

function redirectToClient(res, params) {
    res.redirect(`${settings.PROXY_URI}/#/login?${new URLSearchParams(params)}`)
}

/**
 * Returns the Spotify login URL. The random `state` also goes into a cookie,
 * so the callback can reject requests that did not start here (CSRF protection).
 */
router.get('/', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex')
    res.cookie(STATE_COOKIE, state, cookieOptions(STATE_MAX_AGE))
    res.set('Cache-Control', 'no-store')
    res.send(spotifyOAuth.authorizeURL({
        redirect_uri: callbackUrl,
        scope: settings.SPOTIFY_SCOPE,
        state
    }))
})

router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query
    const expectedState = readCookie(req, STATE_COOKIE)
    res.clearCookie(STATE_COOKIE, { path: COOKIE_PATH })

    if (error) return redirectToClient(res, { error: String(error) })
    if (!state || !expectedState || state !== expectedState) {
        return redirectToClient(res, { error: 'invalid_state' })
    }

    try {
        const accessToken = await spotifyOAuth.getToken({ code: String(code), redirect_uri: callbackUrl })
        // No token goes into the URL. The client asks /refresh for an access token.
        res.cookie(REFRESH_COOKIE, accessToken.token.refresh_token, cookieOptions(REFRESH_MAX_AGE))
        redirectToClient(res, { status: 'success' })
    } catch (err) {
        console.error('Spotify Access Token Error', err.message)
        redirectToClient(res, { error: 'authorization_failed' })
    }
})

/** Returns a new access token for the refresh token in the cookie. 401 means: not logged in. */
router.get('/refresh', async (req, res) => {
    res.set('Cache-Control', 'no-store')
    const refresh_token = readCookie(req, REFRESH_COOKIE)
    if (!refresh_token) return res.status(401).json('not_logged_in')
    try {
        const { token } = await spotifyOAuth.createToken({ refresh_token }).refresh()
        // Spotify may rotate the refresh token. The cookie always keeps the newest one.
        res.cookie(REFRESH_COOKIE, token.refresh_token ?? refresh_token, cookieOptions(REFRESH_MAX_AGE))
        const { access_token, expires_in, scope } = token
        res.status(200).json({ access_token, expires_in, scope })
    } catch (err) {
        console.error('Spotify Refresh Token Error', err.message)
        res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH })
        res.status(401).json('refresh_token_failed')
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH })
    res.status(204).end()
})

module.exports = router
