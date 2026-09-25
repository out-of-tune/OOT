import { AdvancedSearchListener } from "./antlr/AdvancedSearchListener";
import type {
  AttributeContext,
  AttributesContext,
  NodeTypeContext,
  SearchContext,
  SearchPartContext,
} from "./antlr/AdvancedSearchParser";
import type { SearchAttribute, SearchTip } from "@/types/search";

/** Walks the parse tree and collects the node type, the attributes and the autocomplete tip. */
export class SearchListener extends AdvancedSearchListener {
  nodeType: string | undefined = undefined;
  attributes: SearchAttribute[] = [];
  tip: SearchTip | undefined = undefined;
  private lastAttributeIndex = -1;

  override exitNodeType = (ctx: NodeTypeContext) => {
    this.nodeType = ctx.getText();
    this.tip = { type: "nodeType", text: ctx.getText() };
  };

  override exitSearch = (ctx: SearchContext) => {
    if (ctx.getText() === "") {
      this.tip = { type: "nodeType", text: "" };
    }
  };

  override exitSearchPart = (ctx: SearchPartContext) => {
    const attributes = ctx.attributes();
    if (
      ctx.COLON() !== null &&
      (attributes === null || attributes.getText() === "")
    ) {
      this.tip = { type: "attribute", text: "", nodeType: this.nodeType };
    }
    this.nodeType = ctx.nodeType()?.getText();
  };

  override enterAttribute = () => {
    this.tip = undefined;
  };

  override exitAttribute = (ctx: AttributeContext) => {
    // Parts can be missing when the parser recovers from an error.
    const optional = ctx as unknown as {
      attributeSearch(): { getText(): string } | null;
      OPERATOR(): { getText(): string } | null;
      attributeData(): { getText(): string } | null;
    };
    this.attributes.push({
      attributeSearch: optional.attributeSearch()?.getText() ?? "",
      operator: optional.OPERATOR()?.getText() ?? "",
      attributeData: optional.attributeData()?.getText() ?? "",
    });
    this.lastAttributeIndex = this.attributes.length - 1;
  };

  override enterAttributes = () => {
    this.attributes = [];
  };

  override exitAttributes = (ctx: AttributesContext) => {
    const last = this.attributes[this.lastAttributeIndex];
    if (ctx.WHITESPACE().length > 0 && last && !last.attributeData) {
      this.tip = {
        type: "attribute",
        text: last.attributeSearch,
        nodeType: this.nodeType,
      };
    }
  };
}
