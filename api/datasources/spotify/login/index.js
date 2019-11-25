const express = require('express')
const login = express.Router()
const spotify = require('./spotify.js')


login.use('/spotify', spotify)

module.exports = login