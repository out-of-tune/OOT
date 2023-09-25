require('dotenv').config()
const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors')
const createSharedResource = require('./routes/create')

const ensureTypeDirs = require('./directory_structure')

const ensureTypes = require('./middleware/type-enforcement')
const handleErrors = require('./middleware/error-handling')


const app = express()
const port = process.env.SHARE_PORT

app.use(cors())
app.use(bodyParser.json({ limit: '50MB' }))
app.use(bodyParser.urlencoded({ limit: '50MB' , extended: true }))
app.use(check_auth)

const types = process.env.SHARE_TYPES.split(' ')
ensureTypeDirs(process.env.SHARE_LOC, types)

app.post('/:type/create', ensureTypes(types), createSharedResource)
app.use(express.static(process.env.SHARE_LOC, {
    index: false
}))

app.use(handleErrors)

app.listen(port, () => console.log(`Server running on port ${port}`))