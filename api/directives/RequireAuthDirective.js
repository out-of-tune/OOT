const { SchemaDirectiveVisitor } = require("graphql-tools")
const { defaultFieldResolver } = require("graphql")
const AuthenticationError = require('../errors/AuthenticationError')
const AuthorizationError = require('../errors/AuthorizationError')

class RequireAuthDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        const { requires: role } = this.args;
        field.resolve = async function(...args) {
            const [, , ctx] = args;
            if (ctx.user) {
                if (role && !ctx.user.roles.includes(role)) {
                    throw new AuthorizationError()
                } else {
                    const result = await resolve.apply(this, args)
                    return result
                }
            } else
                throw new AuthenticationError()
        }
    }
}

module.exports = RequireAuthDirective