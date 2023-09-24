// import { DataSource } from 'apollo-datasource'
import { Database } from 'arangojs'
import ArtistAPI from './artist'
import GenreAPI from './genre'
import UserAPI from './user'
import SourceAPI from './source'
import AppAPI from './app'

class ArangoAPI {
  artist: ArtistAPI
  genre: GenreAPI
  user: UserAPI
  source: SourceAPI
  app: AppAPI
    constructor() {
        super()
    }

    async connect(arango_url, arango_database, user, password, context=this) {
        try {
            const system = new Database(arango_url)
                .useDatabase('_system')
                .useBasicAuth(user, password)

            const databases = await system.listDatabases()

            if (databases.indexOf(arango_database) === -1) {
                system.createDatabase(arango_database)
            }

            const db = system.useDatabase(arango_database)
            
            context.artist = new ArtistAPI(db)
            context.genre = new GenreAPI(db)
            context.user = new UserAPI(db)
            context.source = new SourceAPI(db)
            context.source.create_initial()
            context.app = new AppAPI(db)
            context.app.create_initial(process.env.CLIENT_KEY, process.env.CLIENT_SECRET)
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

export default ArangoAPI
