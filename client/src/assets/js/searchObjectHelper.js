const antlr4 = require('antlr4/index');
const AdvancedSearchLexer = require('./antlrSource/AdvancedSearchLexer');
const AdvancedSearchParser = require('./antlrSource/AdvancedSearchParser');
const SearchListener = require('./SearchListener').SearchListener
const ErrorListener = require('./ErrorListener').ErrorListener

const getNodeLabels = schema => schema.nodeTypes.map(type=>type.label)
const getNodeTypeByName = (schema, nodeLabel) => schema.nodeTypes.find(nodeType => nodeType.label === nodeLabel)

export function validateSearchObject(searchObject, schema){
    return validateAttributes(searchObject.attributes, searchObject.nodeType, schema)
}

function validateNodeType(nodeType, schema){
    return getNodeLabels(schema).includes(nodeType)
}

function validateAttributes(attributes, nodeType, schema){
    if(validateNodeType(nodeType, schema)){
        const schemaNodeType = getNodeTypeByName(schema, nodeType)
        const attributeFlags = attributes.map(attribute => schemaNodeType.attributes.includes(attribute.attributeSearch))
        return attributeFlags.every(e => e)
    }
}

export const generateSearchObject = input => {
    var chars = new antlr4.InputStream(input);
    var lexer = new AdvancedSearchLexer.AdvancedSearchLexer(chars);
    var tokens  = new antlr4.CommonTokenStream(lexer);
    var parser = new AdvancedSearchParser.AdvancedSearchParser(tokens);
    parser.buildParseTrees = true;   
    var listener = new ErrorListener();

    parser.removeErrorListeners();
    parser.addErrorListener(listener);
    var tree = parser.search();   
    var search = new SearchListener();
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(search, tree);

    const validSearch = listener.errors.length==0

    return {valid: validSearch, errors: listener.errors, nodeType: search.nodeType, attributes: search.attributes, tip: search.tip}
}

function getMatchedTypes(types, text){
    return types.filter((type)=> type.toLowerCase().includes(text.toLowerCase()))
}
export function getAttributes(nodeType, schemaNodeTypes){
    return schemaNodeTypes.filter(schemaNodeType=>nodeType===schemaNodeType.label)[0]["attributes"]
}
export function getMatchingData(tip, typesToMatch){
    if(tip){
        const matching = getMatchedTypes(typesToMatch, tip.text.trim())
        if(matching.length==1&& matching[0]===tip.text){
            return []
        }
        return matching
    }
    return []
}
export function addNeededQuotes(attributePart){
    return attributePart.includes(" ") && attributePart[0]!=="\"" && attributePart[attributePart.length-1]!=="\""
    ?"\""+attributePart+"\""
    :attributePart
}

export default {
    validateSearchObject,
    generateSearchObject,
    getMatchingData,
    addNeededQuotes,
    getAttributes
}