import { InputStream, CommonTokenStream } from "antlr4";
import AdvancedSearchLexer from "./antlrSource/AdvancedSearchLexer.js";
import AdvancedSearchParser from "./antlrSource/AdvancedSearchParser.js";
import ErrorListener from "./ErrorListener.js";
import SearchListener from "./SearchListener.js";
import antlr4 from "antlr4";

const getNodeLabels = (schema) => schema.nodeTypes.map((type) => type.label);
const getNodeTypeByName = (schema, nodeLabel) =>
  schema.nodeTypes.find((nodeType) => nodeType.label === nodeLabel);

export function validateSearchObject(searchObject, schema) {
  return validateAttributes(
    searchObject.attributes,
    searchObject.nodeType,
    schema,
  );
}

function validateNodeType(nodeType, schema) {
  return getNodeLabels(schema).includes(nodeType);
}

function validateAttributes(attributes, nodeType, schema) {
  if (validateNodeType(nodeType, schema)) {
    const schemaNodeType = getNodeTypeByName(schema, nodeType);
    const attributeFlags = attributes.map((attribute) =>
      schemaNodeType.attributes.includes(attribute.attributeSearch),
    );
    return attributeFlags.every((e) => e);
  }
}

export const generateSearchObject = (input) => {
  var chars = new InputStream(input);
  var lexer = new AdvancedSearchLexer(chars);
  var tokens = new CommonTokenStream(lexer);
  var parser = new AdvancedSearchParser(tokens);
  parser.buildParseTrees = true;
  var listener = new ErrorListener();

  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  var tree = parser.search();
  var search = new SearchListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(search, tree);

  const validSearch = listener.errors.length == 0;

  return {
    valid: validSearch,
    errors: listener.errors,
    nodeType: search.nodeType,
    attributes: search.attributes,
    tip: search.tip,
  };
};

function getMatchedTypes(types, text) {
  return types.filter((type) =>
    type.toLowerCase().includes(text.toLowerCase()),
  );
}
export function getAttributes(nodeType, schemaNodeTypes) {
  return schemaNodeTypes.filter(
    (schemaNodeType) => nodeType === schemaNodeType.label,
  )[0]["attributes"];
}
export function getMatchingData(tip, typesToMatch) {
  if (tip) {
    const matching = getMatchedTypes(typesToMatch, tip.text.trim());
    if (matching.length == 1 && matching[0] === tip.text) {
      return [];
    }
    return matching;
  }
  return [];
}
export function addNeededQuotes(attributePart) {
  return attributePart.includes(" ") &&
    attributePart[0] !== '"' &&
    attributePart[attributePart.length - 1] !== '"'
    ? '"' + attributePart + '"'
    : attributePart;
}

export default {
  validateSearchObject,
  generateSearchObject,
  getMatchingData,
  addNeededQuotes,
  getAttributes,
};
