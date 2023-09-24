import express from 'express'
const spotify = express.Router()
import querystring from 'querystring'
import request from 'request-promise-native'
import get_login from './oauth/link'
import callback from './oauth/callback'

import config from '../read-config.js'
const redirect_uri = `http://${config.network.rest_api.host}:${config.network.rest_api.port}/login/spotify/callback/`

const client_id = config.spotify.client_id
const client_secret = config.spotify.client_secret
const spotify_authorize_url = 'https://accounts.spotify.com/authorize'
const spotify_token_url = 'https://accounts.spotify.com/api/token'
const auth_base64 = Buffer.from(client_id + ':' + client_secret).toString('base64')

const stateKey = 'spotify_auth_state';

spotify.get('/', (req, res) => {
	// TODO: Get left-off website from client
	// uri parameter in request must be html-url-encoded
	const client_uri = req.query.uri || `http://${config.network.client.host}:${config.network.client.port}/`
	const scope = config.spotify.scope
	const login = get_login(redirect_uri, scope, client_id, spotify_authorize_url)
	//login user here
	res.cookie(stateKey, {
		state: login.state,
		client_uri: client_uri
	})

	res.send({
		url: login.url
	})
})

spotify.get('/callback', (req, res) => {
	//callback of login here
	const code = req.query.code || null
  	const state = req.query.state || null
  	const error = req.query.error || null
  	const storedState = req.cookies ? req.cookies[stateKey] : null

  	if (state === null || state !== storedState.state) {
  		console.log('state_mismatch')
    	res.redirect('/#' +
      		querystring.stringify({
        		error: 'state_mismatch'
      	}))
    } else if (error !== null) {
    	console.log(error)
  		res.redirect('/#' +
      		querystring.stringify({
        		error: error
      	}))
	} else {
		const client_uri = decodeURI(storedState.client_uri)
		res.clearCookie(stateKey)

		// request token and refresh token from spotify
		const callbk = callback(code, client_uri, redirect_uri, client_secret, client_id)

		const options = {
			url: spotify_token_url,
			...callbk.options
		}

		request.post(options)
		.then(result => res.redirect(
			callbk.request_token(result.access_token, result.refresh_token)
		))
		.catch(err => {
			console.log(err)
		})
	}


})

spotify.get('/refresh', (req, res) => {
	const refresh_token = req.query.refresh_token
	const options = {
		url: spotify_token_url,
		form: {
			refresh_token: refresh_token,
			grant_type: 'refresh_token'
		},
		headers: {
			"Authorization": `Basic ${auth_base64}`,
			"Content-Type": 'application/json'
		},
		json: true
	}
	request.post(options)
	.then(result => {
		const access_token = result.access_token
		const refresh_token_new = result.refresh_token || refresh_token

		res.send({
			access_token: access_token,
			refresh_token: refresh_token_new
		})
	})
	.catch(console.log)
})


export default spotify
