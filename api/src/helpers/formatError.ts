import { GraphQLFormattedError } from 'graphql';
import { NotFoundError } from '../errors/errors.js';

function myFormatError(formattedError: GraphQLFormattedError, error: Error): GraphQLFormattedError {
  if (error.message.startsWith('DataLoader must be constructed')) return new NotFoundError('Id Not Found')
  if (error.message.startsWith('Context creation failed: ')) {
    error.message = error.message.replace('Context creation failed: ', '')
  }

  console.log(formattedError)
  return formattedError
}

export default myFormatError
