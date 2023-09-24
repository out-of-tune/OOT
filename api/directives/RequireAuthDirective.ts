import { defaultFieldResolver } from "graphql"
import AuthenticationError from '../errors/AuthenticationError'
import AuthorizationError from '../errors/AuthorizationError'
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'
 
const authDirectiveTransformer = (schema: GraphQLSchema, directiveName: string) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
        if (authDirective) {
            const { requires } = authDirective
            if (requires) {
            const { resolve = defaultFieldResolver } = fieldConfig
            fieldConfig.resolve = function (source, args, context, info) {
                if (context.user) {
                    if (!context.user.roles.includes(requires)) {
                        throw new AuthorizationError()
                    } else {
                        return resolve.apply(this, args)
                        //return resolve(source, args, context, info)
                    }
                } else
                    throw new AuthenticationError()
            }
            return fieldConfig
            }
        }
        }
    })
}

export default authDirectiveTransformer
