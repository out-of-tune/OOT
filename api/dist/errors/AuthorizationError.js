import { createError } from 'apollo-errors';
const AuthorizationError = createError('AuthorizationError', {
    message: "You are not authorized to access this resource.",
    internalData: {
        skiplog: true
    }
});
export default AuthorizationError;
