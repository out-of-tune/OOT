const { after, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const net = require('node:net')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const index = path.join(__dirname, '..', 'index.js')
const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'share-'))

after(() => fs.rmSync(storage, { recursive: true, force: true }))

function start(port) {
    const child = spawn(process.execPath, [index], {
        env: {
            ...process.env,
            SHARE_PORT: String(port),
            SHARE_LOC: storage,
            // Nothing listens there, so the service keeps waiting for the database.
            ARANGODB_HOST: '127.0.0.1',
            ARANGODB_PORT: '9'
        },
        stdio: ['ignore', 'pipe', 'pipe']
    })
    let output = ''
    child.stdout.on('data', data => { output += data })
    child.stderr.on('data', data => { output += data })
    const exited = new Promise(resolve => child.once('exit', code => resolve({ code, output })))
    const listening = new Promise(resolve => child.stdout.on('data', () => {
        if (output.includes('Server running')) resolve()
    }))
    return { child, exited, listening }
}

describe('server process', () => {
    it('exits with an error when the port is taken', async () => {
        const blocker = net.createServer()
        await new Promise(resolve => blocker.listen(0, resolve))
        const { exited } = start(blocker.address().port)
        const { code, output } = await exited
        blocker.close()
        assert.equal(code, 1)
        assert.match(output, /Could not listen/)
        assert.doesNotMatch(output, /Server running/)
    })

    it('stops on SIGTERM while it waits for the database', async () => {
        const { child, exited, listening } = start(0)
        await listening
        child.kill('SIGTERM')
        const { code } = await exited
        assert.equal(code, 0)
    })
})
