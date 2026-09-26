import {
  BaseErrorListener,
  CharStream,
  CommonTokenStream,
  ParseTreeWalker,
  type ATNSimulator,
  type RecognitionException,
  type Recognizer,
  type Token,
} from "antlr4ng";
import { AdvancedSearchLexer } from "./antlr/AdvancedSearchLexer";
import { AdvancedSearchParser } from "./antlr/AdvancedSearchParser";
import { SearchListener } from "./SearchListener";
import type { Schema, SchemaNodeType } from "@/types/schema";
import type { SearchObject, SearchTip } from "@/types/search";

/** Collects the parser errors instead of printing them. */
class CollectingErrorListener extends BaseErrorListener {
  errors: string[] = [];

  override syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    _offendingSymbol: S | null,
    _line: number,
    _column: number,
    message: string,
    _error: RecognitionException | null,
  ): void {
    this.errors.push(message);
  }
}

/** Parses an advanced search string such as `artist: name="Bob" popularity>50`. */
export const generateSearchObject = (input: string): SearchObject => {
  const lexer = new AdvancedSearchLexer(CharStream.fromString(input));
  // The lexer skips characters that it cannot read. That is not an error for the search.
  lexer.removeErrorListeners();
  const parser = new AdvancedSearchParser(new CommonTokenStream(lexer));
  const errorListener = new CollectingErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(errorListener);

  const listener = new SearchListener();
  ParseTreeWalker.DEFAULT.walk(listener, parser.search());

  return {
    valid: errorListener.errors.length === 0,
    errors: errorListener.errors,
    nodeType: listener.nodeType,
    attributes: listener.attributes,
    tip: listener.tip,
  };
};

const getNodeTypeByName = (schema: Schema, nodeLabel: string | undefined) =>
  schema.nodeTypes.find((nodeType) => nodeType.label === nodeLabel);

/** Search object for the nodes of a type that match a condition. An empty condition matches all of them. */
export const searchObjectForType = (
  nodeLabel: string,
  condition: string,
): SearchObject =>
  generateSearchObject(
    condition.trim() ? `${nodeLabel}: ${condition}` : nodeLabel,
  );

/** Search object of a map size rule: every node of the type, sized by one attribute. */
export const searchObjectForAttribute = (
  nodeLabel: string,
  attribute: string,
): SearchObject => ({
  valid: true,
  errors: [],
  nodeType: nodeLabel,
  attributes: [{ attributeSearch: attribute, operator: "", attributeData: "" }],
});

/** True when the node type and every searched attribute exist in the schema. */
export function validateSearchObject(
  searchObject: SearchObject,
  schema: Schema,
): boolean {
  const schemaNodeType = getNodeTypeByName(schema, searchObject.nodeType);
  if (!schemaNodeType) return false;
  return searchObject.attributes.every((attribute) =>
    schemaNodeType.attributes.includes(attribute.attributeSearch),
  );
}

export function getAttributes(
  nodeType: string | undefined,
  schemaNodeTypes: SchemaNodeType[],
): string[] {
  return (
    schemaNodeTypes.find((schemaNodeType) => schemaNodeType.label === nodeType)
      ?.attributes ?? []
  );
}

/** Autocomplete candidates: the values that contain the text of the tip. */
export function getMatchingData(
  tip: SearchTip | undefined,
  typesToMatch: string[],
): string[] {
  if (!tip) return [];
  const text = tip.text.trim().toLowerCase();
  const matching = typesToMatch.filter((type) =>
    type.toLowerCase().includes(text),
  );
  if (matching.length === 1 && matching[0] === tip.text) return [];
  return matching;
}

/** Wraps a value in quotes if it contains a space and is not quoted yet. */
export function addNeededQuotes(attributePart: string): string {
  return attributePart.includes(" ") &&
    attributePart[0] !== '"' &&
    attributePart[attributePart.length - 1] !== '"'
    ? `"${attributePart}"`
    : attributePart;
}

/**
 * Builds the search string after the user picks an attribute from the autocomplete list.
 * Complete attribute conditions stay, an incomplete last condition is replaced by `picked=`.
 */
export function buildAttributeQuery(
  searchObject: SearchObject,
  picked: string,
): string {
  const attributes = searchObject.attributes
    .filter(
      (attribute, index) =>
        index !== searchObject.attributes.length - 1 ||
        (attribute.attributeSearch &&
          attribute.attributeData &&
          attribute.operator),
    )
    .map(
      (attribute) =>
        addNeededQuotes(attribute.attributeSearch) +
        attribute.operator +
        addNeededQuotes(attribute.attributeData),
    );
  return [...attributes, `${addNeededQuotes(picked)}=`].join(" ");
}

export default {
  validateSearchObject,
  generateSearchObject,
  getMatchingData,
  addNeededQuotes,
  getAttributes,
};
