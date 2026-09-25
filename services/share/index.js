const express = require('express')
const cors = require('cors')
const createSharedResource = require('./routes/create')
const ensureTypeDirs = require('./directory_structure')
const ensureTypes = require('./middleware/type-enforcement')
const handleErrors = require('./middleware/error-handling')
const arango = require('./datasources/arangodb')
const settings = require('./settings')

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Express 5 passes rejected promises of async handlers to the error handlers.
app.post('/:type/create', ensureTypes(settings.TYPES), createSharedResource)
app.use(express.static(settings.STORAGE_PATH, { index: false }))
app.use(handleErrors)

async function main() {
    await ensureTypeDirs(settings.STORAGE_PATH, settings.TYPES)
    app.listen(settings.PORT, () => console.log(`Server running on port ${settings.PORT}`))
    await arango.connect(
        `http://${settings.ARANGO_HOST}:${settings.ARANGO_PORT}`,
        settings.ARANGO_DB,
        settings.ARANGO_USER,
        settings.getArangoPassword()
    )
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
