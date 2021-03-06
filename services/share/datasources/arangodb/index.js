const arangojs = require('arangojs')
const UserAPI = require('./user')
const AppAPI = require('./app')
const ShareAPI = require('./share')

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
            
            context.user = new UserAPI(db)
            context.app = new AppAPI(db)
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
    `http://${process.env.ARANGODB_HOST}:${process.env.ARANGODB_PORT}`, 
    process.env.ARANGODB_DATABASE, 
    process.env.ARANGODB_USER, 
    process.env.ARANGODB_PASSWORD
)

module.exports = arango
