import { Database } from 'arangojs'
import ArtistAPI from './artist.js'
import GenreAPI from './genre.js'
import UserAPI from './user.js'
import SourceAPI from './source.js'
import AppAPI from './app.js'

class ArangoAPI {
    artist: ArtistAPI
    genre: GenreAPI
    user: UserAPI
    source: SourceAPI
    app: AppAPI

    constructor(db: Database) {
        this.artist = new ArtistAPI(db)
        this.genre = new GenreAPI(db)
        this.user = new UserAPI(db)
        this.source = new SourceAPI(db)
        this.app = new AppAPI(db)
    }

    static async connect(arango_url, arango_database, user, password) {
        try {
            const system = new Database(arango_url)
                .useDatabase('_system')
                .useBasicAuth(user, password)

            const databases = await system.listDatabases()

            if (databases.indexOf(arango_database) === -1) {
                system.createDatabase(arango_database)
            }

            const db = system.useDatabase(arango_database)
            ArtistAPI.onConnect(db)
            GenreAPI.onConnect(db)
            UserAPI.onConnect(db)
            SourceAPI.onConnect(db)
            AppAPI.onConnect(db)

            console.log('ArangoDB connected: ', await system.version())
            return db
        } catch(err) {
            if (err.message.startsWith('connect ECONNREFUSED')) {
                console.log(err.message, 'Retrying in 5s...')
                setTimeout(() => ArangoAPI.connect(arango_url, arango_database, user, password), 5000)
            } else console.log(err.message)
        }
    }
}

export default ArangoAPI
