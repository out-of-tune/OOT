import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLFormattedError } from "graphql";
import { NotFoundError } from "../errors/errors.js";
import { isDev } from "./settings.js";

/** The error that a resolver threw, which has the useful stack trace. */
const cause = (error: unknown) => (error instanceof GraphQLError && error.originalError) || error;

/**
 * Turns internal errors into client errors and logs every error.
 * Outside development, clients see a generic message instead of the text of an internal error.
 */
function formatError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const message = error instanceof Error ? error.message : formattedError.message;
  if (message.startsWith("DataLoader must be constructed")) {
    const notFound = new NotFoundError("Id Not Found");
    return { message: notFound.message, extensions: notFound.extensions };
  }
  const code = formattedError.extensions?.code;
  if (code !== ApolloServerErrorCode.INTERNAL_SERVER_ERROR) {
    console.log(formattedError);
    return formattedError;
  }
  console.error("Internal error at", formattedError.path?.join(".") ?? "(no path)", cause(error));
  if (isDev) return formattedError;
  return { ...formattedError, message: "Internal server error", extensions: { code } };
}

export default formatError;
