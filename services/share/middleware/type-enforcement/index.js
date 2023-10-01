function enforceTypes(types) {
    return (req, res, next) => {
        if (types.includes(req.params.type))
            return next()
        else throw new Error('Type not found')
    }
}

export default enforceTypes