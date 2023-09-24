import { merge } from 'lodash';
import artist from './artist';
import genre from './genre';
import user from './user';
import app from './app';
import feedback from './feedback';
const resolvers = merge(artist, genre, user, app, feedback);
export default resolvers;
