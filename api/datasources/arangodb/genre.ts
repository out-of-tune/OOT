import { aql } from 'arangojs'
import DataLoader from 'dataloader'
import BaseAPI from './base'

class GenreAPI extends BaseAPI{
    constructor(db) {
        super(db)
        this._collection('Genre')
        this._collection('subgenre_supergenre', true)
        this._subgenre_loader = new DataLoader(ids => this._subgenres(ids, this.db))
        this._supergenre_loader = new DataLoader(ids => this._supergenres(ids, this.db))
        this._artists_loader = new DataLoader(ids => this._artists(ids, this.db))
    }

    async all() {
        const query = aql`
        FOR g IN Genre
            RETURN {
                name: g.name,
                id: g._id
            }`
        const cursor = await this.db.query(query)
        const data = await cursor.all()
        data.map(genre => this._id_loader.prime(genre.id, genre))
        return data
    }

    async subgenres(id) {
        return this._subgenre_loader.load(id)
    }

    async _subgenres(ids, db=this.db) {
        const query = aql`
        FOR id IN ${ids}
            LET subgenres = (
                FOR v IN 1..1 OUTBOUND Document(id) subgenre_supergenre
                    RETURN {
                        name: v.name,
                        id: v._id
                    }
            )
            RETURN subgenres
        `
        const cursor = await db.query(query)
        return cursor.all()
    }

    async supergenres(id) {
        return await this._supergenre_loader.load(id)
    }

    async _supergenres(ids, db=this.db) {
        const query = aql`
        FOR id in ${ids}
            LET supergenres = (
                FOR v IN 1..1 INBOUND Document(id) subgenre_supergenre
                    RETURN {
                        name: v.name,
                        id: v._id
                    }
            )
            RETURN supergenres
        `
        const cursor = await db.query(query)
        return cursor.all()
    }

    async artists(id) {
        return await this._artists_loader.load(id)
    }

    async _artists(ids, db=this.db) {
        const query = aql`
        FOR id IN ${ids}
            LET artists = (
                FOR v IN 1..1 INBOUND Document(id) artist_genre
                    RETURN {
                        sid : v.sid,
                        mbid: v.mbid,
                        id: v._id
                    }
            )
            RETURN artists
        `
        const cursor = await db.query(query)
        return cursor.all()
    }

    async get(id) {
        return this.get_id(id)
    }

    async search(value, field, limit) {
        const data = await this._search('Genre', value, field, limit)
        data.map(genre => this._id_loader.prime(genre.id, genre))
        return data
    }

    async byName(name, limit) {
        const cursor = await this.db.query(aql`
            FOR g IN Genre
                FILTER LOWER(g.name) LIKE LOWER(${'%' + name + '%'})
                LIMIT ${limit}
                RETURN {
                    name: g.name,
                    id: g._id
                }
        `)
        const data = await cursor.all()
        data.map(genre => this._id_loader.prime(genre.id, genre))
        return data
    }
}

export default GenreAPI
