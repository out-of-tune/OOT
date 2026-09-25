/** Accepts only the configured share types. Anything else would write outside the storage directories. */
function enforceTypes(types) {
    return (req, res, next) => {
        if (types.includes(req.params.type)) return next()
        res.status(404).json({ error: 'Type not found' })
    }
}

module.exports = enforceTypes
