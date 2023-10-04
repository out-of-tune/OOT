import { SpawnOptionsWithoutStdio, spawn } from 'node:child_process'


const logChunk = (name: string, chunk: string, isError?: boolean) => {
    const log = isError ? console.error : console.log
    for (const line of chunk.split('\n'))
        log(`[${name}]: ${line}`)
}

export async function spawnChild(name: string, command: string, args?: string[], options?: SpawnOptionsWithoutStdio) {
    console.log(`[${name}] Started.`)
    const child = spawn(command, args, options)

    for await (const chunk of child.stdout) logChunk(name, chunk.toString())
    for await (const chunk of child.stderr) logChunk(name, chunk.toString(), true)

    const exitCode = await new Promise( (resolve, _) => {
        child.on('close', resolve)
    })

    if(exitCode) {
        throw new Error(`[${name}] subprocess error exit ${exitCode}`)
    }
    console.log(`[${name}] Exited.`)
}
