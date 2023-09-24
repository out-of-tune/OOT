import express from 'express'
const login = express.Router()
import spotify from './spotify'


login.use('/spotify', spotify)

module.exports = login
