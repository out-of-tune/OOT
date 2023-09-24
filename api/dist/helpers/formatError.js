import { isInstance, formatError } from '@apollo/server';
import NotFoundError from '../errors/NotFoundError';
import AuthenticationError from '../errors/AuthenticationError';
function myFormatError(error) {
    if (error.message.startsWith('DataLoader must be constructed'))
        return formatError(new NotFoundError('Id Not Found'));
    if (error.message.startsWith('Context creation failed: ')) {
        error.message = error.message.replace('Context creation failed: ', '');
    }
    if (error.message.startsWith('AuthenticationError: '))
        return formatError(new AuthenticationError({ data: { unexpected: error.message.replace('AuthenticationError: ', '') } }));
    const { originalError } = error;
    if (isInstance(originalError) && !originalError.internalData.skiplog) {
        // log internalData to stdout but not include it in the formattedError
        console.log({
            type: originalError.name,
            data: originalError.data,
            internalData: originalError.internalData
        });
    }
    else if (!isInstance(originalError))
        ;
    console.log(error);
    //console.log(error)
    return formatError(error);
}
export default myFormatError;
