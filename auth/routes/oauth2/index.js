import express from 'express'
import spotifyRoutes from './spotify/index.js'

const router = express.Router()
router.use('/spotify', spotifyRoutes)

export default router