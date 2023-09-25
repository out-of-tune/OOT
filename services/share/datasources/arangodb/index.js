const arangojs = require('arangojs')
const ShareAPI = require('./share')
const settings = require('../../settings')

class ArangoAPI {
    constructor() {
    }

    async connect(arango_url, arango_database, user, password, context=this) {
        try {
            const system = new arangojs.Database(arango_url)
                .useDatabase('_system')
                .useBasicAuth(user, password)

            const databases = await system.listDatabases()

            if (databases.indexOf(arango_database) === -1) {
                system.createDatabase(arango_database)
            }

            const db = system.useDatabase(arango_database)
            
            context.share = new ShareAPI(db)
            console.log('ArangoDB connected: ', await system.version())
            
        } catch(err) {
            if (err.message.startsWith('connect ECONNREFUSED')) {
                console.log(err.message, 'Retrying in 5s...')
                setTimeout(() => context.connect(arango_url, arango_database, user, password, context), 5000)
            } else console.log(err.message)
        }
    }
}

const arango = new ArangoAPI()
arango.connect(
    `http://${settings.ARANGO_HOST}:${settings.ARANGO_PORT}`, 
    settings.ARANGO_DB, 
    settings.ARANGO_USER, 
    settings.getArangoPassword()
)

module.exports = arango
