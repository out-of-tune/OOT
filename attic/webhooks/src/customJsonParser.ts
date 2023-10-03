import express from 'express'
import { mode } from './settings.js'

const log = (...args) => console.log('[JSONParser]', ...args)

const isJSON = (raw: string) => {
    try {
        JSON.parse(raw)
    } catch (e) {
        return false
    }
    return true
}

// This custom JSON parser is necessary, because in the test environment the request stream doesn't end
const customJsonParser: express.RequestHandler = (req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') next()
    log('attempting to parse body')
    let rawBody = '';
    try {
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            log('received chunk', chunk)
            rawBody += chunk
            
            // while testing the stream doesn't end on it's own
            if (isJSON(rawBody)) {
                req.emit('end')
            }
        })
        req.on('end', () => {
            log('stream ended with', rawBody)
            const body = rawBody || '{}' // in case the body is empty
            req.body = JSON.parse(body)
            next()
        })
    } catch (error) {
        log(`Failed to parse body:\n  `, rawBody)
        next(error)
    }
    
}

export const JSONParser = (mode === 'development' ? customJsonParser : express.json())
