import auth from './auth.js'

const authenticate_user = (arango) => async (ctx) => {
    let token = ctx.req.headers['x-access-token'] || ctx.req.headers['authorization']
    
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length)

        const user = await validate_token(token, arango.user)
        if(!user) throw new Error('AuthenticationError: User not found')
        return {
            ...ctx,
            user
        }
    }

    return ctx
}

const authenticate_client = (arango) => async (ctx) => {
    if(matchLocation(ctx.req.body.query, 'mutation{loginapp')) return ctx
    
    const client_token = ctx.req.headers['client-authentication']
    const app = await validate_token(client_token, arango.app)
    if(!app) {
        if (process.env.NODE_ENV !== 'development') throw new Error('AuthenticationError: Source not authenticated')
        console.log("Development Mode: Client is not authenticated")
    }
    
    return ctx
}

async function validate_token(token, lookup) {
    if (!token) return null

    const { id } = auth.validate(token)
    if (!id) throw new Error('AuthenticationError: ID is undefined/null, contact an admin or create a bug report') // probably not necessary anymore

    const obj = await lookup.get_id(id)
    return obj
}

function matchLocation(query, loc) {
    if (!query) return query
    query = query.replace(/\r?\n|\r/g, '')
    query = query.replace(/ +/g, '')
    return query.startsWith(loc)
}

export default {
    authenticate_user,
    authenticate_client
}
