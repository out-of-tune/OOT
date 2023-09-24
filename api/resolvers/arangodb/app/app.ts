import auth from '../../../auth'

const resolvers = {
    Mutation: {
        loginapp: async (_, { base }, { dataSources }) => {
            if (process.env.NODE_ENV === 'development') console.log('testkey', 'secret', Buffer.from('testkey:secret').toString('base64'))
            const [key, secret] = Buffer.from(base, 'base64').toString('ascii').split(':')
            if (process.env.NODE_ENV === 'development') console.log(key, secret)
            const app = await dataSources.arango.app.fetch(key)
            if(app.length === 0 || app[0].secret !== secret) return {
                success: false,
                message: 'Authentication unsuccessful'
            }

            return {
                success: true,
                message: 'Logged in successfully!',
                token: auth.generateToken({ id: app[0].id })
            }
        }
    }
}

export default resolvers
