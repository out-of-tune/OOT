// Generated from AdvancedSearch.g4 by ANTLR 4.13.0
// jshint ignore: start
import antlr4 from "antlr4";
import AdvancedSearchListener from "./AdvancedSearchListener.js";
const serializedATN = [
  4, 1, 8, 42, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5,
  7, 5, 2, 6, 7, 6, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 1, 3,
  1, 4, 1, 4, 4, 4, 27, 8, 4, 11, 4, 12, 4, 28, 1, 5, 1, 5, 1, 5, 3, 5, 34, 8,
  5, 1, 6, 5, 6, 37, 8, 6, 10, 6, 12, 6, 40, 9, 6, 1, 6, 0, 0, 7, 0, 2, 4, 6, 8,
  10, 12, 0, 2, 1, 0, 1, 2, 1, 0, 1, 3, 37, 0, 14, 1, 0, 0, 0, 2, 16, 1, 0, 0,
  0, 4, 18, 1, 0, 0, 0, 6, 20, 1, 0, 0, 0, 8, 26, 1, 0, 0, 0, 10, 30, 1, 0, 0,
  0, 12, 38, 1, 0, 0, 0, 14, 15, 5, 1, 0, 0, 15, 1, 1, 0, 0, 0, 16, 17, 7, 0, 0,
  0, 17, 3, 1, 0, 0, 0, 18, 19, 7, 1, 0, 0, 19, 5, 1, 0, 0, 0, 20, 21, 3, 2, 1,
  0, 21, 22, 5, 6, 0, 0, 22, 23, 3, 4, 2, 0, 23, 7, 1, 0, 0, 0, 24, 25, 5, 4, 0,
  0, 25, 27, 3, 6, 3, 0, 26, 24, 1, 0, 0, 0, 27, 28, 1, 0, 0, 0, 28, 26, 1, 0,
  0, 0, 28, 29, 1, 0, 0, 0, 29, 9, 1, 0, 0, 0, 30, 33, 3, 0, 0, 0, 31, 32, 5, 5,
  0, 0, 32, 34, 3, 8, 4, 0, 33, 31, 1, 0, 0, 0, 33, 34, 1, 0, 0, 0, 34, 11, 1,
  0, 0, 0, 35, 37, 3, 10, 5, 0, 36, 35, 1, 0, 0, 0, 37, 40, 1, 0, 0, 0, 38, 36,
  1, 0, 0, 0, 38, 39, 1, 0, 0, 0, 39, 13, 1, 0, 0, 0, 40, 38, 1, 0, 0, 0, 3, 28,
  33, 38,
];

const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map(
  (ds, index) => new antlr4.dfa.DFA(ds, index),
);

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class AdvancedSearchParser extends antlr4.Parser {
  static grammarFileName = "AdvancedSearch.g4";
  static literalNames = [];
  static symbolicNames = [
    null,
    "WORD",
    "TEXT",
    "DECIMAL",
    "WHITESPACE",
    "COLON",
    "OPERATOR",
    "OPENPARAN",
    "CLOSEPARAN",
  ];
  static ruleNames = [
    "nodeType",
    "attributeSearch",
    "attributeData",
    "attribute",
    "attributes",
    "searchPart",
    "search",
  ];

  constructor(input) {
    super(input);
    this._interp = new antlr4.atn.ParserATNSimulator(
      this,
      atn,
      decisionsToDFA,
      sharedContextCache,
    );
    this.ruleNames = AdvancedSearchParser.ruleNames;
    this.literalNames = AdvancedSearchParser.literalNames;
    this.symbolicNames = AdvancedSearchParser.symbolicNames;
  }

  nodeType() {
    let localctx = new NodeTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, AdvancedSearchParser.RULE_nodeType);
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 14;
      this.match(AdvancedSearchParser.WORD);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  attributeSearch() {
    let localctx = new AttributeSearchContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, AdvancedSearchParser.RULE_attributeSearch);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 16;
      _la = this._input.LA(1);
      if (!(_la === 1 || _la === 2)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  attributeData() {
    let localctx = new AttributeDataContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, AdvancedSearchParser.RULE_attributeData);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 18;
      _la = this._input.LA(1);
      if (!((_la & ~0x1f) === 0 && ((1 << _la) & 14) !== 0)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  attribute() {
    let localctx = new AttributeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, AdvancedSearchParser.RULE_attribute);
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 20;
      this.attributeSearch();
      this.state = 21;
      this.match(AdvancedSearchParser.OPERATOR);
      this.state = 22;
      this.attributeData();
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  attributes() {
    let localctx = new AttributesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, AdvancedSearchParser.RULE_attributes);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 26;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
      do {
        this.state = 24;
        this.match(AdvancedSearchParser.WHITESPACE);
        this.state = 25;
        this.attribute();
        this.state = 28;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
      } while (_la === 4);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  searchPart() {
    let localctx = new SearchPartContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, AdvancedSearchParser.RULE_searchPart);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 30;
      this.nodeType();
      this.state = 33;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
      if (_la === 5) {
        this.state = 31;
        this.match(AdvancedSearchParser.COLON);
        this.state = 32;
        this.attributes();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  search() {
    let localctx = new SearchContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, AdvancedSearchParser.RULE_search);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 38;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
      while (_la === 1) {
        this.state = 35;
        this.searchPart();
        this.state = 40;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
}

AdvancedSearchParser.EOF = antlr4.Token.EOF;
AdvancedSearchParser.WORD = 1;
AdvancedSearchParser.TEXT = 2;
AdvancedSearchParser.DECIMAL = 3;
AdvancedSearchParser.WHITESPACE = 4;
AdvancedSearchParser.COLON = 5;
AdvancedSearchParser.OPERATOR = 6;
AdvancedSearchParser.OPENPARAN = 7;
AdvancedSearchParser.CLOSEPARAN = 8;

AdvancedSearchParser.RULE_nodeType = 0;
AdvancedSearchParser.RULE_attributeSearch = 1;
AdvancedSearchParser.RULE_attributeData = 2;
AdvancedSearchParser.RULE_attribute = 3;
AdvancedSearchParser.RULE_attributes = 4;
AdvancedSearchParser.RULE_searchPart = 5;
AdvancedSearchParser.RULE_search = 6;

class NodeTypeContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_nodeType;
  }

  WORD() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
  }

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterNodeType(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitNodeType(this);
    }
  }
}

class AttributeSearchContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributeSearch;
  }

  WORD() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
  }

  TEXT() {
    return this.getToken(AdvancedSearchParser.TEXT, 0);
  }

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterAttributeSearch(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitAttributeSearch(this);
    }
  }
}

class AttributeDataContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributeData;
  }

  WORD() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
  }

  TEXT() {
    return this.getToken(AdvancedSearchParser.TEXT, 0);
  }

  DECIMAL() {
    return this.getToken(AdvancedSearchParser.DECIMAL, 0);
  }

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterAttributeData(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitAttributeData(this);
    }
  }
}

class AttributeContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attribute;
  }

  attributeSearch() {
    return this.getTypedRuleContext(AttributeSearchContext, 0);
  }

  OPERATOR() {
    return this.getToken(AdvancedSearchParser.OPERATOR, 0);
  }

  attributeData() {
    return this.getTypedRuleContext(AttributeDataContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterAttribute(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitAttribute(this);
    }
  }
}

class AttributesContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributes;
  }

  WHITESPACE = function (i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTokens(AdvancedSearchParser.WHITESPACE);
    } else {
      return this.getToken(AdvancedSearchParser.WHITESPACE, i);
    }
  };

  attribute = function (i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTypedRuleContexts(AttributeContext);
    } else {
      return this.getTypedRuleContext(AttributeContext, i);
    }
  };

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterAttributes(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitAttributes(this);
    }
  }
}

class SearchPartContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_searchPart;
  }

  nodeType() {
    return this.getTypedRuleContext(NodeTypeContext, 0);
  }

  COLON() {
    return this.getToken(AdvancedSearchParser.COLON, 0);
  }

  attributes() {
    return this.getTypedRuleContext(AttributesContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterSearchPart(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitSearchPart(this);
    }
  }
}

class SearchContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_search;
  }

  searchPart = function (i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTypedRuleContexts(SearchPartContext);
    } else {
      return this.getTypedRuleContext(SearchPartContext, i);
    }
  };

  enterRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.enterSearch(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof AdvancedSearchListener) {
      listener.exitSearch(this);
    }
  }
}

AdvancedSearchParser.NodeTypeContext = NodeTypeContext;
AdvancedSearchParser.AttributeSearchContext = AttributeSearchContext;
AdvancedSearchParser.AttributeDataContext = AttributeDataContext;
AdvancedSearchParser.AttributeContext = AttributeContext;
AdvancedSearchParser.AttributesContext = AttributesContext;
AdvancedSearchParser.SearchPartContext = SearchPartContext;
AdvancedSearchParser.SearchContext = SearchContext;
