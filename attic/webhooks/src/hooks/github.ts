import express from 'express'
import * as crypto from "crypto"
import { githubSecret } from '../settings.js'
import { spawnChild } from '../child.js'
import fs from 'fs/promises'
import { JSONParser } from '../customJsonParser.js'


type HookHandler = (request: express.Request) => void


const verifySignature = (req: express.Request) => {
  const signatureHeader = req.headers["x-hub-signature-256"]
  if ( !signatureHeader || Array.isArray(signatureHeader)) {
    console.log('[Authentication] No header provided (X-Hub-Signature-256)')
    return false
  }
  const spaces = req.body?.data?.spaces
  const formatted = JSON.stringify(req.body, null, spaces)
  console.log(formatted, formatted.length, spaces)
  const signature = crypto
    .createHmac("sha256", githubSecret)
    .update(formatted)
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
  const file = `${process.cwd()}/testing/success`
  fs.writeFile(file, '')
  console.log(`Test Event was called: Successful (${file})`)
}

const hookMap: {[k: string]: HookHandler} = {
  ping: pingHook,
  deploy: deployHook,
  test: testHook
}

export const githubRouter = express.Router()
githubRouter.use(JSONParser)

githubRouter.post('/', (request, response) => {
  if (!verifySignature(request)) return response.status(401).send("Unauthorized")

  response.status(202).send('Accepted')
  const githubEvent = request.headers['x-github-event']

  if (Array.isArray(githubEvent)) console.warn(`Unsupported array of events: [${githubEvent}]`)
  else if (githubEvent && githubEvent in hookMap) hookMap[githubEvent](request)
  else console.warn(`Unhandled event: ${githubEvent}`)
})