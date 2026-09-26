const app = require('./app')
const settings = require('./settings')

/** Longest wait for open requests on shutdown, in milliseconds. */
const SHUTDOWN_TIMEOUT = 5000

const server = app.listen(settings.PORT, error => {
    if (error) {
        console.error(`Could not listen on port ${settings.PORT}:`, error.message)
        process.exit(1)
    }
    console.log(`Server running on port ${settings.PORT}`)
})

// As PID 1 in a container, Node does not stop on SIGTERM unless it handles the signal.
function shutdown(signal) {
    console.log(`${signal} received. Closing the server...`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), SHUTDOWN_TIMEOUT).unref()
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
