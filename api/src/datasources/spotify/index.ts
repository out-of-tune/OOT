// import { DataSource } from 'apollo-datasource';
import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import got, { RequestError, Response } from 'got';

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time))

class SpotifyAPI extends RESTDataSource {
    client_id: string;
    client_secret: string;
    scope: string;
    access_token: string;
    constructor(options: { cache: KeyValueCache }, client_id: string, client_secret: string, scope: string) {
        super(options)
        this.client_id = client_id
        this.client_secret = client_secret
        this.scope = scope
        this.access_token = ""
    }
    initialize() {/* Apollo calls this with every request */}

    start() {
        this.setToken()
    }
    async setToken(){
        var authOptions = {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.client_id + ':' + this.client_secret).toString('base64'))
            },
            form: {
                grant_type: 'client_credentials'
            }
        }
        try {
            const res: any = await got.post('https://accounts.spotify.com/api/token', authOptions).json()
            console.log(`Loaded spotify token: ${JSON.stringify(res)}`)
            this.access_token = res.access_token
            await delay(res.expires_in*500)
        } catch (e) {
            const response: Response = e.response
            console.log(`Error trying too fetch Spotify token (${response?.statusCode}): ${response?.body}`)
            console.log('Retrying...')
            await delay(1000)
        }
        this.setToken()
    }
    getToken(){
        return {token:this.access_token}
    }

    async artist_info(sid: string) {
        const res: any = await got.get(`https://api.spotify.com/v1/artists/${sid}`, {
            headers: {
                'Authorization': `Bearer ${this.getToken().token}`
            }
        }).json()
        return transform_artist(res)
    }
}

function transform_artist(artist) {
    return {
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        images: artist.images.map(img => img.url)
    }
}

export default SpotifyAPI
