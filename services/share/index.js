const express = require('express')
const cors = require('cors')
const createSharedResource = require('./routes/create')
const ensureTypeDirs = require('./directory_structure')
const ensureTypes = require('./middleware/type-enforcement')
const handleErrors = require('./middleware/error-handling')
const arango = require('./datasources/arangodb')
const settings = require('./settings')

/** Longest wait for open requests on shutdown, in milliseconds. */
const SHUTDOWN_TIMEOUT = 5000

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Express 5 passes rejected promises of async handlers to the error handlers.
app.post('/:type/create', ensureTypes(settings.TYPES), createSharedResource)
app.use(express.static(settings.STORAGE_PATH, { index: false }))
app.use(handleErrors)

async function main() {
    await ensureTypeDirs(settings.STORAGE_PATH, settings.TYPES)
    const server = app.listen(settings.PORT, error => {
        if (error) {
            console.error(`Could not listen on port ${settings.PORT}:`, error.message)
            process.exit(1)
        }
        console.log(`Server running on port ${settings.PORT}`)
    })
    // As PID 1 in a container, Node does not stop on SIGTERM unless it handles the signal.
    const shutdown = signal => {
        console.log(`${signal} received. Closing the server...`)
        server.close(() => process.exit(0))
        setTimeout(() => process.exit(0), SHUTDOWN_TIMEOUT).unref()
    }
    process.once('SIGTERM', shutdown)
    process.once('SIGINT', shutdown)
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
