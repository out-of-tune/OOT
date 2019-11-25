const express = require('express')
const simpleOauth = require('simple-oauth2')
const qs = require('querystring')
const router = express.Router()

const callbackUrl = `${process.env.PROXY_URI}/${process.env.AUTH_HOST}/oauth2/spotify/callback`
const scope = process.env.SPOTIFY_SCOPE

const client_url = process.env.PROXY_URI

const spotify_oauth = simpleOauth.create({
    client: {
        id: process.env.SPOTIFY_CLIENT_ID,
        secret: process.env.SPOTIFY_CLIENT_SECRET
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
    scope
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
        res.redirect(`${client_url}/#/login?${qs.stringify(result)}`)
    } catch(error) {
        console.error('Spotify Access Token Error', error.message)
        res.redirect(`${client_url}/#/login?${qs.stringify({
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