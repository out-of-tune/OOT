const express = require('express')
const router = express.Router()

const appRoutes = require('./app')

router.use('/app', appRoutes)

module.exports = router