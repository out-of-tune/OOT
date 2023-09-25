require('dotenv').config()
const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors')
const createSharedResource = require('./routes/create')

const ensureTypeDirs = require('./directory_structure')

const ensureTypes = require('./middleware/type-enforcement')
const handleErrors = require('./middleware/error-handling')
const settings = require('./settings')


const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '50MB' }))
app.use(bodyParser.urlencoded({ limit: '50MB' , extended: true }))

ensureTypeDirs(settings.STORAGE_PATH, settings.TYPES)

app.post('/:type/create', ensureTypes(settings.TYPES), createSharedResource)
app.use(express.static(settings.STORAGE_PATH, {
    index: false
}))

app.use(handleErrors)

app.listen(settings.PORT, () => console.log(`Server running on port ${settings.PORT}`))