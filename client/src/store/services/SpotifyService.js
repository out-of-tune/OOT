import axios from "axios"
import _ from "lodash/fp"
class SpotifyService {
  constructor() {
    this.api = 'https://api.spotify.com/v1/'
  }
  getFromAPI(url, token, params = null, tries = 0) {
    let config = {}
    if (params) {
      config.params = params
    }
    config.headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
    return new Promise((resolve, reject) => {
      axios.get(this.api + url, config)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          // if(tries<3){
          //     setTimeout(this.getFromAPI(url, token, params, tries+1), 500);
          // }
          // else {
          //     reject(error)
          // }
          reject(error)
        })
    })
  }

  postToApi(url, token, params) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
    return new Promise((resolve, reject) => {
      axios.post(encodeURI(this.api + url), params, { headers: headers })
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  putToApi(url, token, params) {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
    return new Promise((resolve, reject) => {
      axios.put(encodeURI(this.api + url), params, { headers: headers })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async requestAll(requestFunction, offset = 0) {
    const result = await requestFunction(offset)
    if (result.next) {
      const nextResult = await this.requestAll(requestFunction, offset + result.limit)
      const r = { items: [...result.items, ...nextResult.items] }
      return r
    } else return result
  }

  getSongSamplesFromArtist(token, artistId) {
    const url = `artists/${artistId}/top-tracks`
    const result = this.getFromAPI(url, token, { country: "AT" })
    return result
  }

  getCurrentUserPlaylists(token, limit = 50, offset = 0) {
    return this.getFromAPI('me/playlists', token, {
      limit,
      offset
    }
    )
  }

  getPlaylist(token, uri) {
    const url = `playlists/${uri}`
    return this.getFromAPI(url, token)
  }
  getCurrentUserProfile(token) {
    return this.getFromAPI('me', token)
  }

  async getAlbumsFromArtist(token, sid) {
    return this.requestAll(offset => this.getFromAPI(`artists/${sid}/albums`, token, { offset }))
  }

  async getSongsFromAlbum(token, sid) {
    return this.requestAll(offset => this.getFromAPI(`albums/${sid}/tracks`, token, { offset }))
  }

  getFullSongData(token, sids) {
    const sidsString = sids.join(',')
    return this.getFromAPI(`tracks/`, token, { ids: sidsString })
  }

  addSongToPlaylist(token, playlistId, songUri) {
    return this.postToApi(`playlists/${playlistId}/tracks`, token, { uris: [songUri] })
  }

  addSongToQueue(token, songUri) {
    return this.postToApi(`me/player/queue?uri=${songUri}`, token, { uri: songUri })
  }

  async addSongsToPlaylist(token, playlistId, songUris) {
    const chunkedSongUris = _.chunk(100)(songUris)
    return await Promise.all(chunkedSongUris.map((chunk) => {
      return this.postToApi(`playlists/${playlistId}/tracks`, token, { uris: chunk })
    }))
  }

  getArtistsById(token, sids) {
    const sidsString = sids.join(',')
    return this.getFromAPI(`artists/`, token, { ids: sidsString })
  }

  searchByString(token, searchString, types, limit) {
    const stringifiedTypes = types.join(",")
    return this.getFromAPI(`search`, token, { q: searchString, type: stringifiedTypes, limit: limit })
  }

  async getSongsFromPlaylist(token, sid) {
    return this.requestAll(offset => this.getFromAPI(`playlists/${sid}/tracks`, token, { offset }))
  }

  play(token, uris) {
    this.putToApi('me/player/play', token, { uris })
  }
}
export default new SpotifyService()
