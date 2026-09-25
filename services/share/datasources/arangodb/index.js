const { Database } = require('arangojs')
const ShareAPI = require('./share')
const settings = require('../../settings')

/** Wait between connection attempts while the database starts, in milliseconds. */
const RETRY_DELAY = 5000

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

const isConnectionRefused = error =>
    /ECONNREFUSED|fetch failed/.test(`${error.message} ${String(error.cause)}`)

/** Holds the data sources. `share` is set once the database is reachable. */
const arango = {
    share: null,

    /** Connects and creates the database and the collection if they are missing. Retries until the server is up. */
    async connect(url, databaseName, username, password) {
        const system = new Database({ url, databaseName: '_system', auth: { username, password } })
        for (;;) {
            try {
                const databases = await system.listDatabases()
                if (!databases.includes(databaseName)) await system.createDatabase(databaseName)
                const share = new ShareAPI(system.database(databaseName))
                await share.ensureCollection()
                this.share = share
                console.log('ArangoDB connected:', (await system.version()).version)
                return
            } catch (error) {
                if (!isConnectionRefused(error)) throw error
                console.log(`ArangoDB is not reachable. Retrying in ${RETRY_DELAY / 1000}s...`)
                await delay(RETRY_DELAY)
            }
        }
    }
}

module.exports = arango
