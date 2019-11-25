const antlr4 = require('antlr4/index');


var ErrorListener = function() {
    antlr4.error.ErrorListener.call(this);
    this.errors=[]
    return this;
  };
  
ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
ErrorListener.prototype.constructor = ErrorListener;
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
    this.errors.push(msg);
};

exports.ErrorListener = ErrorListener;