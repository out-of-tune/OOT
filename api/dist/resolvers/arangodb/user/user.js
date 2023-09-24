import InvalidInputError from '../../../errors/InvalidInputError';
import NotFoundError from '../../../errors/NotFoundError';
import auth from '../../../auth';
const resolvers = {
    Query: {
        me: async (_, __, { user }) => (user),
        user: async (_, { id, name, email, limit }, { dataSources, user }) => {
            const filters = { id, name, email };
            if (Object.values(filters).filter(val => val).length > 1)
                throw new InvalidInputError({
                    data: {
                        location: 'user',
                        input: filters,
                        unexpected: 'Exactly one field is expected to be set. Multiple fields are ambiguous.'
                    }
                });
            console.log(user);
            if (id)
                return [{ id }];
            if (email)
                return dataSources.arango.user.fetch(email);
            if (name)
                return dataSources.arango.user.byName(name, limit);
            return [user];
        }
    },
    User: {
        email: async ({ id }, _, { dataSources }) => (await dataSources.arango.user.get_id(id)).email,
        firstname: async ({ id }, _, { dataSources }) => (await dataSources.arango.user.get_id(id)).firstname,
        lastname: async ({ id }, _, { dataSources }) => (await dataSources.arango.user.get_id(id)).lastname,
        name: async ({ id }, _, { dataSources }) => (await dataSources.arango.user.get_id(id)).name
    },
    Mutation: {
        login: async (_, { email }, { dataSources }) => {
            const user = await dataSources.arango.user.fetch(email);
            if (user.length === 0)
                return {
                    success: false,
                    message: 'No user with that email found'
                };
            return {
                success: true,
                message: 'Logged in successfully!',
                token: auth.generateToken({ id: user[0].id }),
                user: user[0]
            };
        },
        signup: async (_, { user }, { dataSources }) => {
            if ((await dataSources.arango.user.fetch(user.email)).length !== 0)
                throw new InvalidInputError({
                    data: {
                        location: 'signup',
                        input: user,
                        unexpected: 'User with this email already exists.'
                    }
                });
            const nuser = await dataSources.arango.user.create(user, ['USER']);
            return {
                success: true,
                message: 'Registered successfully!',
                token: auth.generateToken({ id: nuser.id }),
                user: nuser
            };
        },
        addroles: async (_, { id, roles }, { dataSources }) => {
            const user = await dataSources.arango.user.get_id(id);
            if (!user)
                throw new NotFoundError({
                    data: {
                        location: 'addroles',
                        input: id
                    }
                });
            const existing_roles = user.roles ? user.roles : [];
            const nuser = await dataSources.arango.user.update(id, { roles: [...new Set([...existing_roles, ...roles])] });
            return !!nuser;
        }
    }
};
export default resolvers;
