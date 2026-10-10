/**
 * Formats a value as a GraphQL string literal.
 * JSON string escapes are valid GraphQL string escapes, so quotes and
 * backslashes in user input cannot break out of the literal.
 */
export const gqlString = (value: string | number): string =>
  JSON.stringify(String(value));
