import dotenv from 'dotenv'
dotenv.config()

export const port = Number.parseInt(process.env.WEBHOOKS_PORT) || 3004
export const githubSecret = process.env.GITHUB_SECRET

const config = {
    port,
    githubSecret
}

console.log(`Loaded config: ${Object.keys(config).map(k => `\n -> ${k}: ${config[k]}`).join('')}`)