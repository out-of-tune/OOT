import jwt from 'jsonwebtoken'
import { type } from 'os'

const secret = () => process.env.JWT_SECRET

function sign(obj, exp) {
    return jwt.sign(obj, secret(), { expiresIn: exp })
}

function validate(token) {
    try {
        const res = jwt.verify(token, secret())
        if (typeof(res) == "string") return {id: res}
        else return res
    } catch (err) {
        throw new Error('Invalid token provided')
    }
}

function generateToken(obj) {
    const exp = '24h'
    return {
        token: sign(obj, exp),
        expires_in: exp
    }
}

export default {
    validate,
    generateToken
}
