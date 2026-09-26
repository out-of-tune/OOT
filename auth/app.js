const express = require('express')
const cors = require('cors')
const oauth2Routes = require('./routes/oauth2')
const settings = require('./settings')

const app = express()

app.use(cors({ origin: settings.CORS_ORIGINS, credentials: true }))
app.use('/oauth2', oauth2Routes)

module.exports = app
