// import { DataSource } from 'apollo-datasource';
import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import request from 'request';
import rp from 'request-promise-native';

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
        this.setToken(this)
    }
    setToken(context){
        console.log(context)
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
              'Authorization': 'Basic ' + (Buffer.from(context.client_id + ':' + context.client_secret).toString('base64'))
            },
            form: {
              grant_type: 'client_credentials'
            },
            json: true
          }
        request.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                context.access_token = response.body.access_token
                setTimeout(context.setToken, response.body.expires_in*500, context)
            } else {
                console.log(response ? response.statusCode : 'Error' + ': ' + error)
                console.log('Retrying...')
                setTimeout(context.setToken, 1000, context)
            }
        })
    }
    getToken(){
        return {token:this.access_token}
    }

    async artist_info(sid: string) {
        const res = await rp.get(`https://api.spotify.com/v1/artists/${sid}`, {
            headers: {
                'Authorization': `Bearer ${this.getToken().token}`
            },
            json: true
        })
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
