import { aql } from 'arangojs'
import DataLoader from 'dataloader'
import BaseAPI from './base'


class ArtistAPI extends BaseAPI {
    constructor(db) {
        super(db)
        this._collection('Artist')
        this._collection('artist_source', true)
        this._collection('artist_genre', true)
        this._info_loader = new DataLoader(ids => this._info(ids, this.db))
        this._genres_loader = new DataLoader(ids => this._genres(ids, this.db))
    }

    async info(id) {
        return await this._info_loader.load(id)
    }

    async _info(ids, db=this.db) {
        const cursor = await db.query(aql`
        FOR id IN ${ids}
            FOR v, e IN 1..1 OUTBOUND Document(id) artist_source
                RETURN e
        `)
        return cursor.all()
    }

    async genres(id) {
        return await this._genres_loader.load(id)
    }

    async _genres(ids, db=this.db) {
        const cursor = await db.query(aql`
        FOR id IN ${ids}
            LET genres = (
                FOR v IN 1..1 OUTBOUND Document(id) artist_genre
                    RETURN {
                        name: v.name,
                        id: v._id
                    }
                )
            RETURN genres
        `)
        return cursor.all()
    }

    async get(id) {
        return this.get_id(id)
    }

    async search(value, field, limit) {
        const data = await this._search('Artist', value, field, limit)
        data.map(artist => this._id_loader.prime(artist.id, artist))
        return data
    }

    async byName(name, limit) {
        const query = aql`
        FOR e IN artist_source
            FILTER LOWER(e.name) LIKE LOWER(${'%' + name + '%'})
            LIMIT ${limit}
            RETURN {
                name: e.name,
                id: e._from,
                popularity: e.popularity,
                images: e.images
            }`
        const cursor = await this.db.query(query)
        const data = await cursor.all()
        data.map(artist => this._info_loader.prime(artist.id, artist))
        return data
    }

    async create(artist) {
        return await super._create('Artist', artist)
    }

    async createInfo(info, artist_id) {
        const spotify_source_id = 'Source/0'
        return await super.link(artist_id, spotify_source_id, 'artist_source', info)
    }

    async linkGenres(artist_id, genres) {
        const genre_ids = await Promise.all(genres.map(async g => { 
            const genres = await super._search('Genre', g, 'name')
            if (!genres.length) return (await super._create('Genre', { name: g })).id
            return genres[0].id
        }))
        return await this._linkGenres(artist_id, genre_ids)
    }

    async _linkGenres(artist_id, genre_ids) {
        genre_ids.map(gid => super.link(artist_id, gid, 'artist_genre'))
    }
}

export default ArtistAPI
