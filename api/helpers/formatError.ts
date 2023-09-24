import { unwrapResolverError } from '@apollo/server/errors';
import NotFoundError from '../errors/NotFoundError'
import AuthenticationError from '../errors/AuthenticationError'
import { GraphQLFormattedError } from 'graphql';
import { isInstance } from 'apollo-errors';

function myFormatError(formattedError: GraphQLFormattedError, error: Error): GraphQLFormattedError {
  // if (unwrapResolverError(error) instanceof CustomDBError) {
  //   return { message: 'Internal server error' };
  // }
  if (error.message.startsWith('DataLoader must be constructed')) return new NotFoundError('Id Not Found')
  if (error.message.startsWith('Context creation failed: ')) {
    error.message = error.message.replace('Context creation failed: ', '')
  }

  if (error.message.startsWith('AuthenticationError: ')) return new AuthenticationError({ data: { unexpected: error.message.replace('AuthenticationError: ', '') } })

  // if (isInstance(error) && !error.internalData.skiplog) {
    // log internalData to stdout but not include it in the formattedError
    // console.log({
    //   type: error.name,
      // data: error.data,
      // internalData: error.internalData
    // })
  // } else if (!isInstance(error))
  //   console.log(error)
  console.log(formattedError)
  return formattedError
}

export default myFormatError
