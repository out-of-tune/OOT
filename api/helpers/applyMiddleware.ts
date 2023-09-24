function applyMiddleware(middlewares) {
    return async (obj) => {
        const ctx = await middlewares
            .map(resolveInput)
            .reduce(async (ctx, middleware) => await middleware(ctx), Promise.resolve(obj))
        return ctx
    }
}

function resolveInput(middleware) {
    return async (promise) => {
        return await middleware(await promise)
    }
}

export default applyMiddleware
