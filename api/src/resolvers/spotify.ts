const resolvers = {
  Query: {
    publicToken: (_parent: unknown, _args: unknown, { dataSources }) => dataSources.spotify.getToken(),
  },
};

export default resolvers;
