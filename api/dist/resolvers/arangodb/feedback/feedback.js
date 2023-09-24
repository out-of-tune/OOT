const resolvers = {
    Mutation: {
        createfeedback: async (_, { feedback, email, type, group }, { dataSources }) => {
            const res = await dataSources.arango.feedback.create({
                email,
                type,
                feedback,
                group
            });
            if (!res)
                return false;
            return true;
        }
    }
};
export default resolvers;
