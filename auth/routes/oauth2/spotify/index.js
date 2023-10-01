import express from 'express'
import simpleOauth from 'simple-oauth2'
import qs from 'querystring'
import { Config } from '@out-of-tune/settings'


const callbackUrl = `${Config.general.proxyURI}/auth/oauth2/spotify/callback`

const spotify_oauth = simpleOauth.create({
    client: {
        id: Config.spotify.clientId,
        secret: Config.spotify.clientSecret
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
    scope: Config.spotify.scope
})

const router = express.Router()
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
        res.redirect(`${Config.general.proxyURI}/#/login?${qs.stringify(result)}`)
    } catch(error) {
        console.error('Spotify Access Token Error', error.message)
        res.redirect(`${Config.general.proxyURI}/#/login?${qs.stringify({
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

export default router