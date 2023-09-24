import { createError } from 'apollo-errors';
const NotFoundError = createError('NotFoundError', {
    message: 'The id was not found.',
    internalData: {
        skiplog: true
    }
});
export default NotFoundError;
