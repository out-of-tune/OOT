import _ from 'lodash'

import artist from './artist/artist.js'
import genre from './genre/genre.js'
import feedback from './feedback/feedback.js'
const resolvers = _.merge(
    artist,
    genre,
    feedback
)
export default resolvers
