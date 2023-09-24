import _ from 'lodash'
import arangodb from './arangodb/arangodb.js'
import spotify from './spotify.js'
const resolvers = _.merge(
    arangodb,
    spotify
)
export default resolvers
