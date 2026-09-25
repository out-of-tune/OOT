const crypto = require('node:crypto')
const express = require('express')
const { AuthorizationCode } = require('simple-oauth2')
const settings = require('../../../settings')

const router = express.Router()

const callbackUrl = `${settings.PROXY_URI}/auth/oauth2/spotify/callback`
const STATE_COOKIE = 'oot_oauth_state'
/** How long a login may take, in seconds. */
const STATE_MAX_AGE = 600

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

/** The fields of a Spotify token that the client needs. */
function tokenFields(token) {
    const { access_token, refresh_token, expires_in, token_type, scope } = token
    return Object.fromEntries(
        Object.entries({ access_token, refresh_token, expires_in, token_type, scope })
            .filter(([, value]) => value !== undefined)
    )
}

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
    res.cookie(STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: settings.PROXY_URI.startsWith('https://'),
        maxAge: STATE_MAX_AGE * 1000,
        path: '/auth/oauth2/spotify'
    })
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
    res.clearCookie(STATE_COOKIE, { path: '/auth/oauth2/spotify' })

    if (error) return redirectToClient(res, { error: String(error) })
    if (!state || !expectedState || state !== expectedState) {
        return redirectToClient(res, { error: 'invalid_state' })
    }

    try {
        const accessToken = await spotifyOAuth.getToken({ code: String(code), redirect_uri: callbackUrl })
        redirectToClient(res, tokenFields(accessToken.token))
    } catch (err) {
        console.error('Spotify Access Token Error', err.message)
        redirectToClient(res, { error: 'authorization_failed' })
    }
})

router.get('/refresh', async (req, res) => {
    const refresh_token = String(req.query.refresh_token ?? '')
    if (!refresh_token) return res.status(400).json('refresh_token_missing')
    try {
        const { token } = await spotifyOAuth.createToken({ refresh_token }).refresh()
        res.set('Cache-Control', 'no-store')
        // Spotify does not always return a new refresh token. The old one stays valid then.
        res.status(200).json({ refresh_token, ...tokenFields(token) })
    } catch (err) {
        console.error('Spotify Refresh Token Error', err.message)
        res.status(500).json('refresh_token_failed')
    }
})

module.exports = router
