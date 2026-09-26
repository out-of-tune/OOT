import { afterEach, expect, test, vi } from 'vitest'
import { GraphQLError } from 'graphql'

const load = async (nodeEnv: string) => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', nodeEnv)
    return (await import('./formatError.js')).default
}

const internal = { message: 'connect ECONNREFUSED 10.0.0.5:8529', path: ['artist'], extensions: { code: 'INTERNAL_SERVER_ERROR' } }

afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
})

test('logs internal errors and hides their text in production', async () => {
    const formatError = await load('production')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cause = new Error(internal.message)
    const result = formatError(internal, new GraphQLError(internal.message, { originalError: cause, path: ['artist'] }))
    expect(result).toEqual({ message: 'Internal server error', path: ['artist'], extensions: { code: 'INTERNAL_SERVER_ERROR' } })
    expect(log).toHaveBeenCalledWith('Internal error at', 'artist', cause)
})

test('shows internal errors in development', async () => {
    const formatError = await load('development')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(formatError(internal, new Error(internal.message))).toBe(internal)
})

test('passes client errors through and logs them', async () => {
    const formatError = await load('production')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const badInput = { message: 'Set exactly one of id, sid, mbid and name.', extensions: { code: 'BAD_USER_INPUT' } }
    expect(formatError(badInput, new Error(badInput.message))).toBe(badInput)
    expect(log).toHaveBeenCalledWith(badInput)
})
