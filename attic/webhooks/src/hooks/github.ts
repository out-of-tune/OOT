import express from 'express'
import * as crypto from "crypto"
import { githubSecret } from '../settings.js'
import { spawnChild } from '../child.js'
import fs from 'fs/promises'


type HookHandler = (request: express.Request) => void


const verifySignature = (req: express.Request) => {
  const signatureHeader = req.headers["x-hub-signature-256"]
  if ( !signatureHeader || Array.isArray(signatureHeader)) return false

  const signature = crypto
    .createHmac("sha256", githubSecret)
    .update(JSON.stringify(req.body))
    .digest("hex")
  const trusted = Buffer.from(`sha256=${signature}`, 'ascii')
  const untrusted =  Buffer.from(signatureHeader, 'ascii')
  return crypto.timingSafeEqual(trusted, untrusted)
}

const pingHook: HookHandler = (_) => console.log('GitHub sent the ping event')

const deployHook: HookHandler = (_) => {
  spawnChild('RestartProd', './start-prod.sh', [], {cwd: '../..'}).catch(
    err =>  {console.error("async error:\n" + err)}
  )
}

const testHook: HookHandler = (_) => {
  fs.writeFile('testing/success', '')
  console.log("Test Event was called: Successful")
}

const standardHookMap: {[k: string]: HookHandler} = {
  ping: pingHook
}
const customHookMap: {[k: string]: HookHandler} = {
  deploy: deployHook,
  test: testHook
}

export const githubRouter = express.Router()

githubRouter.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  if (!verifySignature(request)) return response.status(401).send("Unauthorized")

  response.status(202).send('Accepted')
  const githubEvent = request.headers['x-github-event']

  if (Array.isArray(githubEvent)) console.warn(`Unsupported array of events: [${githubEvent}]`)
  else if (githubEvent in standardHookMap) standardHookMap[githubEvent](request)
  else if (githubEvent !== undefined) console.warn(`Unhandled event: ${githubEvent}`)
  else {
    try {
      const data = request.body
      const event = data.event
      if (event in customHookMap) customHookMap[event](request)
      else console.warn(`Unhandled custom event: ${event}`)
    } catch (error) {
      console.warn(`Unknown request: ${request}\nError: ${error}`)
    }
  }
})


