import _ from 'lodash'

import artist from './artist/artist.js'
import genre from './genre/genre.js'
import user from './user/user.js'
import app from './app/app.js'
import feedback from './feedback/feedback.js'
const resolvers = _.merge(
    artist,
    genre,
    user,
    app,
    feedback
)
export default resolvers
