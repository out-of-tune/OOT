import { aql } from 'arangojs'
import BaseAPI from './base'
import { User } from '../../src/generated/graphql'

class UserAPI extends BaseAPI {
  static collection = "User"

  create(user, roles) {
    return super._create('User', { ...user, roles })
  }

  async search(value, field, limit) {
    const data = await this._search('User', value, field, limit)
    data.forEach(user => this._id_loader.prime(user.id, user))
    return data
  }

  async byName(name, limit) {
    const query = aql`
        FOR u IN User
            FILTER LOWER(u.name) LIKE LOWER(${'%' + name + '%'})
            LIMIT ${limit}
            RETURN u`
    const cursor = await this.db.query(query)
    const data = (await cursor.all()).map(this.reducer)
    data.forEach(user => this._id_loader.prime(user.id, user))
    return data
  }

  fetch(email) {
    return this.search(email, 'email', 1)
  }

  /**
   * 
   * @param id id of the user to update
   * @param fields dict of keys and values to update the user document
   * @returns changed user document
   */
  update(id: string, fields: {[key: string]: any}): Promise<User> {
    return this.set_fields('User', id, fields)
  }
}

export default UserAPI
