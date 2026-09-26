import { Validator } from "jsonschema";

/** Parses JSON text and checks it against a JSON schema. Throws an error that lists the invalid properties. */
export function parseJsonWithSchema<T>(json: string, jsonSchema: object): T {
  const result = new Validator().validate(JSON.parse(json), jsonSchema);
  if (result.errors.length > 0) {
    throw new Error(
      result.errors.map((error) => `error at ${error.property}`).join("\n"),
    );
  }
  return result.instance as T;
}
