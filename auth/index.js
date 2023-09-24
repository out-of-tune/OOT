const express = require('express')
const cors = require('cors')
const oauth2Routes = require('./routes/oauth2')
const authRoutes = require('./routes/auth')


const app = express()
const port = 4000

app.use(cors())

app.use('/oauth2', oauth2Routes)
app.use('/', authRoutes) // Note: when testing this could break routing, since /oauth2 is also on /; remove after testing

app.listen(port, () => console.log(`Server running on port ${port}`))