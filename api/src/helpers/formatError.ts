import type { GraphQLFormattedError } from "graphql";
import { NotFoundError } from "../errors/errors.js";
import { isDev } from "./settings.js";

/** Turns internal errors into client errors and hides details outside development. */
function formatError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const message = error instanceof Error ? error.message : formattedError.message;
  if (message.startsWith("DataLoader must be constructed")) {
    const notFound = new NotFoundError("Id Not Found");
    return { message: notFound.message, extensions: notFound.extensions };
  }
  if (isDev) console.log(formattedError);
  return formattedError;
}

export default formatError;
