const resolvers = {
    Query: {
        publicToken: (_,{},{dataSources}) => dataSources.spotify.getToken()
    }
}

export default resolvers
