import { Config } from '@out-of-tune/settings';
Config.load(Config.share, Config.arangodb)

import express from 'express'
import bodyParser from "body-parser"
import cors from 'cors'
import createSharedResource from './routes/create/index.js'
import ensureTypeDirs from './directory_structure/index.js'
import ensureTypes from './middleware/type-enforcement/index.js'
import handleErrors from './middleware/error-handling/index.js'


const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '50MB' }))
app.use(bodyParser.urlencoded({ limit: '50MB' , extended: true }))

ensureTypeDirs(Config.share.directory, Config.share.types)

app.post('/:type/create', ensureTypes(Config.share.types), createSharedResource)
app.use(express.static(Config.share.directory, {
    index: false
}))

app.use(handleErrors)

app.listen(Config.share.port, () => console.log(`Server running on port ${Config.share.port}`))