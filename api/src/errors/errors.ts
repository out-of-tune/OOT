import { GraphQLError } from "graphql";

/** The arguments of a query are invalid. Clients see the code `BAD_USER_INPUT`. */
export class InvalidInputError extends GraphQLError {
  constructor(message = "The input for the endpoint was invalid.", data?: Record<string, unknown>) {
    super(message, { extensions: { code: "BAD_USER_INPUT", data } });
    this.name = "InvalidInputError";
  }
}

/** The requested id does not exist. Clients see the code `NOT_FOUND`. */
export class NotFoundError extends GraphQLError {
  constructor(message = "The id was not found.") {
    super(message, { extensions: { code: "NOT_FOUND" } });
    this.name = "NotFoundError";
  }
}
