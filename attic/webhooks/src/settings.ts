import dotenv from 'dotenv'
dotenv.config()

export const port = Number.parseInt(process.env.WEBHOOKS_PORT) || 3004
export const githubSecret = process.env.GITHUB_SECRET
export const mode = process.env.NODE_ENV

const config = {
    port,
    githubSecret,
    mode
}

console.log(`Loaded config: ${Object.keys(config).map(k => `\n -> ${k}: ${config[k]}`).join('')}`)
