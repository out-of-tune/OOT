import { merge } from 'lodash';
import arangodb from './arangodb';
import spotify from './spotify';
const resolvers = merge(arangodb, spotify);
export default { resolvers };
