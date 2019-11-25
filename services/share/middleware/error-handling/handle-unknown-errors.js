function handle_error(err, req, res, next) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' })
}
module.exports = handle_error