const express = require('express')
const simpleOauth = require('simple-oauth2')
const qs = require('querystring')
const router = express.Router()
const settings = require('../../../settings')

const callbackUrl = `${settings.PROXY_URI}/auth/oauth2/spotify/callback`

const spotify_oauth = simpleOauth.create({
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

const authorizationUrl = spotify_oauth.authorizationCode.authorizeURL({
    redirect_uri: callbackUrl,
    scope: settings.SPOTIFY_SCOPE
})

router.get('/', (req, res) => {
    console.log('returning spotify authorization page')
    res.send(authorizationUrl)
})

router.get('/callback', async (req, res) => {
    const code = req.query.code
    const options = {
        code,
        redirect_uri: callbackUrl
    }

    try {
        const result = await spotify_oauth.authorizationCode.getToken(options)
        res.redirect(`${settings.PROXY_URI}/#/login?${qs.stringify(result)}`)
    } catch(error) {
        console.error('Spotify Access Token Error', error.message)
        res.redirect(`${settings.PROXY_URI}/#/login?${qs.stringify({
            error: 'authorization_failed'
        })}`)
    }

})

router.get('/refresh', async (req, res) => {
    const refresh_token = req.query.refresh_token
    const tokenObj = spotify_oauth.accessToken.create({ refresh_token })
    try {
        const { token } = await tokenObj.refresh()
        res.status(200).json({
            refresh_token,
            ...token
        })
    } catch(error) {
        console.error('Spotify Refresh Token Error', error.message)
        res.status(500).json('refresh_token_failed')
    }
})

router.get('/test', (req, res) => {
    res.send('Hello<br><a href="/oauth2/spotify">Log in with Spotify</a>')
})

module.exports = router