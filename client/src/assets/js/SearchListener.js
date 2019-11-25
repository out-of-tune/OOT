const antlr4 = require('antlr4/index');
const AdvancedSearchLexer = require('./antlrSource/AdvancedSearchLexer');
const AdvancedSearchParser = require('./antlrSource/AdvancedSearchParser');
let AdvancedSearchListener = require('./antlrSource/AdvancedSearchListener').AdvancedSearchListener;

let SearchListener = function() {
    this.attributes=[]
    AdvancedSearchListener.call(this); // inherit default listener
    return this;
};

// inherit default listener
SearchListener.prototype = Object.create(AdvancedSearchListener.prototype);
SearchListener.prototype.constructor = SearchListener;

AdvancedSearchListener.prototype.exitNodeType = function(ctx) {
    this.nodeType=ctx.getText()
    this.tip={type: "nodeType", text: ctx.getText()}; 
};
AdvancedSearchListener.prototype.exitSearch = function(ctx) {
    if(ctx.getText()===""){
        this.tip={type: "nodeType", text: ctx.getText()}; 
    }
};

AdvancedSearchListener.prototype.exitSearchPart = function(ctx) {
    if(ctx.COLON()!=null && ctx.attributes().getText()===""){
        this.isColonSet = true
        this.tip = {type: "attribute", text: ctx.attributes().getText(), nodeType:this.nodeType}
    }
    this.nodeType = ctx.nodeType().getText()
};

AdvancedSearchListener.prototype.enterAttribute = function(ctx) {
    this.tip=undefined
};

AdvancedSearchListener.prototype.exitAttribute = function(ctx) {
    const searchPart = ctx.attributeSearch()
        ?ctx.attributeSearch().getText()
        :""
    const operator = ctx.OPERATOR()
        ?ctx.OPERATOR().getText()
        :""
    const attributePart = ctx.attributeData()?
        ctx.attributeData().getText():
        ""

    this.attributes.push({attributeSearch:searchPart, operator:operator, attributeData:attributePart})
    this.lastAttributeIndex = this.attributes.length-1
};


AdvancedSearchListener.prototype.enterAttributes = function(ctx) {
    this.attributes = []
};


AdvancedSearchListener.prototype.exitAttributes = function(ctx) {
    if(ctx.WHITESPACE().length && !this.attributes[this.lastAttributeIndex].attributeData){
        this.tip = {type: "attribute", text: this.attributes[this.lastAttributeIndex].attributeSearch, nodeType:this.nodeType}
    }
};

exports.SearchListener = SearchListener;