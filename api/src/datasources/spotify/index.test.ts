import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { delay } from '../../helpers/delay.js'
import SpotifyAPI, { SpotifyRequestError } from './index.js'

vi.mock('../../helpers/delay.js', () => ({ delay: vi.fn(async () => {}) }))

const artist = { name: 'A', genres: ['rock'], popularity: 5, images: [{ url: 'a.png' }] }
const ok = () => new Response(JSON.stringify(artist), { status: 200 })
const status = (code: number, headers: Record<string, string> = {}) => new Response('error', { status: code, headers })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(delay).mockClear()
})

afterEach(() => vi.unstubAllGlobals())

test('retries network errors and server errors', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(status(503)).mockResolvedValueOnce(ok())
    const info = await new SpotifyAPI('id', 'secret').artist_info('sid')
    expect(info).toEqual({ name: 'A', genres: ['rock'], popularity: 5, images: ['a.png'] })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(vi.mocked(delay).mock.calls).toEqual([[500], [1000]])
})

test('waits for Retry-After on 429', async () => {
    fetchMock.mockResolvedValueOnce(status(429, { 'retry-after': '3' })).mockResolvedValueOnce(ok())
    await new SpotifyAPI('id', 'secret').artist_info('sid')
    expect(vi.mocked(delay).mock.calls).toEqual([[3000]])
})

test('fails at once when Retry-After is too long', async () => {
    fetchMock.mockResolvedValue(status(429, { 'retry-after': '3600' }))
    await expect(new SpotifyAPI('id', 'secret').artist_info('sid')).rejects.toMatchObject({ status: 429 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('gives up after two retries', async () => {
    fetchMock.mockImplementation(async () => status(502))
    await expect(new SpotifyAPI('id', 'secret').artist_info('sid')).rejects.toBeInstanceOf(SpotifyRequestError)
    expect(fetchMock).toHaveBeenCalledTimes(3)
})

test('does not retry client errors', async () => {
    fetchMock.mockResolvedValue(status(400))
    await expect(new SpotifyAPI('id', 'secret').artist_info('sid')).rejects.toMatchObject({ status: 400 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
})
