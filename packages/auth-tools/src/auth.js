const jwt = require('jsonwebtoken')
const AuthenticationError = require('@out-of-tune/errors').AuthenticationError

const secret = () => process.env.JWT_SECRET

function sign(obj, exp) {
    return jwt.sign(obj, secret(), { expiresIn: exp })
}

function validate(token) {
    try {
        return jwt.verify(token, secret())
    } catch (err) {
        throw new AuthenticationError('JWT', 'Invalid token provided')
    }
}

function generateToken(obj) {
    const exp = '24h'
    return {
        token: sign(obj, exp),
        expires_in: exp
    }
}

module.exports = {
    validate,
    generateToken
}