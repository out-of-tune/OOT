const express = require('express')
const router = express.Router()
const spotifyRoutes = require('./spotify')

router.use('/spotify', spotifyRoutes)

module.exports = router