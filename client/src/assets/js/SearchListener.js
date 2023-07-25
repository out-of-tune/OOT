import AdvancedSearchListener from "./antlrSource/AdvancedSearchListener.js"

export default class SearchListener extends AdvancedSearchListener {
  constructor() {
    super()
    this.attributes = []
  }
  exitNodeType(ctx) {
    this.nodeType = ctx.getText()
    this.tip = { type: "nodeType", text: ctx.getText() };
  }
  exitSearch(ctx) {
    if (ctx.getText() === "") {
      this.tip = { type: "nodeType", text: ctx.getText() };
    }
  }
  exitSearchPart(ctx) {
    if (ctx.COLON() != null && ctx.attributes().getText() === "") {
      this.isColonSet = true
      this.tip = { type: "attribute", text: ctx.attributes().getText(), nodeType: this.nodeType }
    }
    this.nodeType = ctx.nodeType().getText()
  }
  enterAttribute = function(ctx) {
    this.tip = undefined
  }
  exitAttribute = function(ctx) {
    const searchPart = ctx.attributeSearch()
      ? ctx.attributeSearch().getText()
      : ""
    const operator = ctx.OPERATOR()
      ? ctx.OPERATOR().getText()
      : ""
    const attributePart = ctx.attributeData() ?
      ctx.attributeData().getText() :
      ""

    this.attributes.push({ attributeSearch: searchPart, operator: operator, attributeData: attributePart })
    this.lastAttributeIndex = this.attributes.length - 1
  }
  enterAttributes(ctx) {
    this.attributes = []
  }
  exitAttributes(ctx) {
    if (ctx.WHITESPACE().length && !this.attributes[this.lastAttributeIndex].attributeData) {
      this.tip = { type: "attribute", text: this.attributes[this.lastAttributeIndex].attributeSearch, nodeType: this.nodeType }
    }
  }
};
