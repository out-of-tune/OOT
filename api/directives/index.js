const DepractedDirective = require('./DepracatedDirective')
const RequireAuthDirective = require('./RequireAuthDirective')

const schemaDirectives = {
    depracated: DepractedDirective,
    auth: RequireAuthDirective
}

module.exports = schemaDirectives