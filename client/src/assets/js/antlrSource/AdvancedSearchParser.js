// Generated from ./src/store/modules/search/antlrSource/AdvancedSearch.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4');
var AdvancedSearchListener = require('./AdvancedSearchListener').AdvancedSearchListener;
var grammarFileName = "AdvancedSearch.g4";


var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003\n,\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t\u0004",
    "\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004\b",
    "\t\b\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0004\u0003",
    "\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0006\u0003",
    "\u0006\u0006\u0006\u001d\n\u0006\r\u0006\u000e\u0006\u001e\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0005\u0007$\n\u0007\u0003\b\u0007\b\'\n\b",
    "\f\b\u000e\b*\u000b\b\u0003\b\u0002\u0002\t\u0002\u0004\u0006\b\n\f",
    "\u000e\u0002\u0004\u0003\u0002\u0003\u0004\u0003\u0002\u0003\u0005\u0002",
    "\'\u0002\u0010\u0003\u0002\u0002\u0002\u0004\u0012\u0003\u0002\u0002",
    "\u0002\u0006\u0014\u0003\u0002\u0002\u0002\b\u0016\u0003\u0002\u0002",
    "\u0002\n\u001c\u0003\u0002\u0002\u0002\f \u0003\u0002\u0002\u0002\u000e",
    "(\u0003\u0002\u0002\u0002\u0010\u0011\u0007\u0003\u0002\u0002\u0011",
    "\u0003\u0003\u0002\u0002\u0002\u0012\u0013\t\u0002\u0002\u0002\u0013",
    "\u0005\u0003\u0002\u0002\u0002\u0014\u0015\t\u0003\u0002\u0002\u0015",
    "\u0007\u0003\u0002\u0002\u0002\u0016\u0017\u0005\u0004\u0003\u0002\u0017",
    "\u0018\u0007\b\u0002\u0002\u0018\u0019\u0005\u0006\u0004\u0002\u0019",
    "\t\u0003\u0002\u0002\u0002\u001a\u001b\u0007\u0006\u0002\u0002\u001b",
    "\u001d\u0005\b\u0005\u0002\u001c\u001a\u0003\u0002\u0002\u0002\u001d",
    "\u001e\u0003\u0002\u0002\u0002\u001e\u001c\u0003\u0002\u0002\u0002\u001e",
    "\u001f\u0003\u0002\u0002\u0002\u001f\u000b\u0003\u0002\u0002\u0002 ",
    "#\u0005\u0002\u0002\u0002!\"\u0007\u0007\u0002\u0002\"$\u0005\n\u0006",
    "\u0002#!\u0003\u0002\u0002\u0002#$\u0003\u0002\u0002\u0002$\r\u0003",
    "\u0002\u0002\u0002%\'\u0005\f\u0007\u0002&%\u0003\u0002\u0002\u0002",
    "\'*\u0003\u0002\u0002\u0002(&\u0003\u0002\u0002\u0002()\u0003\u0002",
    "\u0002\u0002)\u000f\u0003\u0002\u0002\u0002*(\u0003\u0002\u0002\u0002",
    "\u0005\u001e#("].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [  ];

var symbolicNames = [ null, "WORD", "TEXT", "DECIMAL", "WHITESPACE", "COLON", 
                      "OPERATOR", "OPENPARAN", "CLOSEPARAN" ];

var ruleNames =  [ "nodeType", "attributeSearch", "attributeData", "attribute", 
                   "attributes", "searchPart", "search" ];

function AdvancedSearchParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

AdvancedSearchParser.prototype = Object.create(antlr4.Parser.prototype);
AdvancedSearchParser.prototype.constructor = AdvancedSearchParser;

Object.defineProperty(AdvancedSearchParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

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


function NodeTypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_nodeType;
    return this;
}

NodeTypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NodeTypeContext.prototype.constructor = NodeTypeContext;

NodeTypeContext.prototype.WORD = function() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
};

NodeTypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterNodeType(this);
	}
};

NodeTypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitNodeType(this);
	}
};




AdvancedSearchParser.NodeTypeContext = NodeTypeContext;

AdvancedSearchParser.prototype.nodeType = function() {

    var localctx = new NodeTypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, AdvancedSearchParser.RULE_nodeType);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 14;
        this.match(AdvancedSearchParser.WORD);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function AttributeSearchContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributeSearch;
    return this;
}

AttributeSearchContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AttributeSearchContext.prototype.constructor = AttributeSearchContext;

AttributeSearchContext.prototype.WORD = function() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
};

AttributeSearchContext.prototype.TEXT = function() {
    return this.getToken(AdvancedSearchParser.TEXT, 0);
};

AttributeSearchContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterAttributeSearch(this);
	}
};

AttributeSearchContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitAttributeSearch(this);
	}
};




AdvancedSearchParser.AttributeSearchContext = AttributeSearchContext;

AdvancedSearchParser.prototype.attributeSearch = function() {

    var localctx = new AttributeSearchContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, AdvancedSearchParser.RULE_attributeSearch);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 16;
        _la = this._input.LA(1);
        if(!(_la===AdvancedSearchParser.WORD || _la===AdvancedSearchParser.TEXT)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function AttributeDataContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributeData;
    return this;
}

AttributeDataContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AttributeDataContext.prototype.constructor = AttributeDataContext;

AttributeDataContext.prototype.WORD = function() {
    return this.getToken(AdvancedSearchParser.WORD, 0);
};

AttributeDataContext.prototype.TEXT = function() {
    return this.getToken(AdvancedSearchParser.TEXT, 0);
};

AttributeDataContext.prototype.DECIMAL = function() {
    return this.getToken(AdvancedSearchParser.DECIMAL, 0);
};

AttributeDataContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterAttributeData(this);
	}
};

AttributeDataContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitAttributeData(this);
	}
};




AdvancedSearchParser.AttributeDataContext = AttributeDataContext;

AdvancedSearchParser.prototype.attributeData = function() {

    var localctx = new AttributeDataContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, AdvancedSearchParser.RULE_attributeData);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 18;
        _la = this._input.LA(1);
        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << AdvancedSearchParser.WORD) | (1 << AdvancedSearchParser.TEXT) | (1 << AdvancedSearchParser.DECIMAL))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function AttributeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attribute;
    return this;
}

AttributeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AttributeContext.prototype.constructor = AttributeContext;

AttributeContext.prototype.attributeSearch = function() {
    return this.getTypedRuleContext(AttributeSearchContext,0);
};

AttributeContext.prototype.OPERATOR = function() {
    return this.getToken(AdvancedSearchParser.OPERATOR, 0);
};

AttributeContext.prototype.attributeData = function() {
    return this.getTypedRuleContext(AttributeDataContext,0);
};

AttributeContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterAttribute(this);
	}
};

AttributeContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitAttribute(this);
	}
};




AdvancedSearchParser.AttributeContext = AttributeContext;

AdvancedSearchParser.prototype.attribute = function() {

    var localctx = new AttributeContext(this, this._ctx, this.state);
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
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function AttributesContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_attributes;
    return this;
}

AttributesContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AttributesContext.prototype.constructor = AttributesContext;

AttributesContext.prototype.WHITESPACE = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(AdvancedSearchParser.WHITESPACE);
    } else {
        return this.getToken(AdvancedSearchParser.WHITESPACE, i);
    }
};


AttributesContext.prototype.attribute = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(AttributeContext);
    } else {
        return this.getTypedRuleContext(AttributeContext,i);
    }
};

AttributesContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterAttributes(this);
	}
};

AttributesContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitAttributes(this);
	}
};




AdvancedSearchParser.AttributesContext = AttributesContext;

AdvancedSearchParser.prototype.attributes = function() {

    var localctx = new AttributesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, AdvancedSearchParser.RULE_attributes);
    var _la = 0; // Token type
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
        } while(_la===AdvancedSearchParser.WHITESPACE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function SearchPartContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_searchPart;
    return this;
}

SearchPartContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SearchPartContext.prototype.constructor = SearchPartContext;

SearchPartContext.prototype.nodeType = function() {
    return this.getTypedRuleContext(NodeTypeContext,0);
};

SearchPartContext.prototype.COLON = function() {
    return this.getToken(AdvancedSearchParser.COLON, 0);
};

SearchPartContext.prototype.attributes = function() {
    return this.getTypedRuleContext(AttributesContext,0);
};

SearchPartContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterSearchPart(this);
	}
};

SearchPartContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitSearchPart(this);
	}
};




AdvancedSearchParser.SearchPartContext = SearchPartContext;

AdvancedSearchParser.prototype.searchPart = function() {

    var localctx = new SearchPartContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, AdvancedSearchParser.RULE_searchPart);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 30;
        this.nodeType();
        this.state = 33;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===AdvancedSearchParser.COLON) {
            this.state = 31;
            this.match(AdvancedSearchParser.COLON);
            this.state = 32;
            this.attributes();
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


function SearchContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = AdvancedSearchParser.RULE_search;
    return this;
}

SearchContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SearchContext.prototype.constructor = SearchContext;

SearchContext.prototype.searchPart = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SearchPartContext);
    } else {
        return this.getTypedRuleContext(SearchPartContext,i);
    }
};

SearchContext.prototype.enterRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.enterSearch(this);
	}
};

SearchContext.prototype.exitRule = function(listener) {
    if(listener instanceof AdvancedSearchListener ) {
        listener.exitSearch(this);
	}
};




AdvancedSearchParser.SearchContext = SearchContext;

AdvancedSearchParser.prototype.search = function() {

    var localctx = new SearchContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, AdvancedSearchParser.RULE_search);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 38;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===AdvancedSearchParser.WORD) {
            this.state = 35;
            this.searchPart();
            this.state = 40;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
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
};


exports.AdvancedSearchParser = AdvancedSearchParser;
