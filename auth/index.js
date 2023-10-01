import { Config } from '@out-of-tune/settings'
Config.load([Config.general, Config.spotify])

import express from 'express'
import cors from 'cors'
import oauth2Routes from './routes/oauth2/index.js'

const app = express()
const port = 4000

app.use(cors())

app.use('/oauth2', oauth2Routes)

app.listen(port, () => console.log(`Server running on port ${port}`))