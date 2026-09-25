const express = require('express')
const cors = require('cors')
const oauth2Routes = require('./routes/oauth2')

const app = express()

app.use(cors())
app.use('/oauth2', oauth2Routes)

module.exports = app
