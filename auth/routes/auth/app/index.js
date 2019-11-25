const express = require('express')
const router = express.Router()

const auth = require('@out-of-tune/auth-tools')

const arango = require('../../../datasources/arangodb')

router.post('/login', async (req, res) => {
    const base = req.headers['app-login']

    if (!base) return res.status(400).json({
        error: 'No App-Login header provided'
    })

    const [key, secret] = Buffer.from(base, 'base64').toString('ascii').split(':')

    const app = await arango.app.fetch(key)
    if(app.length === 0 || app[0].secret !== secret) return res.status(400).json({
        error: 'Authentication unsuccessful'
    })

    res.json({
        success: true,
        message: 'Logged in successfully!',
        token: auth.generateToken({ id: app[0].id })
    })
})

module.exports = router