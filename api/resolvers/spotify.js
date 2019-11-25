const resolvers = {
    Query: {
        publicToken: (_,{},{dataSources}) => dataSources.spotify.getToken()
    }
}

module.exports = resolvers