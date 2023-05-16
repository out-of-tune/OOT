const { DataSource } = require('apollo-datasource')
const arangojs = require('arangojs')
const ArtistAPI = require('./artist')
const GenreAPI = require('./genre')
const UserAPI = require('./user')
const SourceAPI = require('./source')
const AppAPI = require('./app')

class ArangoAPI extends DataSource {
    constructor() {
        super()
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
            
            context.artist = await ArtistAPI.createAPI(db)
            context.genre = await GenreAPI.createAPI(db)
            context.user = await UserAPI.createAPI(db)
            context.source = await SourceAPI.createAPI(db)
            context.app = await AppAPI.createAPI(db, process.env.CLIENT_KEY, process.env.CLIENT_SECRET)
            console.log('ArangoDB connected: ', await system.version())
            
        } catch(err) {
            if (err.message.startsWith('connect ECONNREFUSED')) {
                console.log(err.message, 'Retrying in 5s...')
                setTimeout(() => context.connect(arango_url, arango_database, user, password, context), 5000)
            } else console.log(err.message)
        }
    }

    initialize(config) {
        this.context = config.context
        this.artist.initialize(config)
        this.user.initialize(config)
        this.genre.initialize(config)
    }
}

module.exports = ArangoAPI
