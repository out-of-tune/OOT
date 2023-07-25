import antlr4 from "antlr4"

export default class ErrorListener {
    errors = []
    syntaxError(rec, sym, line, col, msg, e) {
        this.errors.push(msg)
    }
}
