const express = require('express')
const cors = require('cors')
const oauth2Routes = require('./routes/oauth2')


const app = express()
const port = 4000

app.use(cors())

app.use('/oauth2', oauth2Routes)

app.listen(port, () => console.log(`Server running on port ${port}`))