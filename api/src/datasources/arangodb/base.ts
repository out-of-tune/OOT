import DataLoader from "dataloader";
import { aql, type Database } from "arangojs";
import type { AqlValue } from "arangojs/aql";
import { CollectionType } from "arangojs/collections";
import { InvalidInputError } from "../../errors/errors.js";

export type Document = { id: string; [key: string]: unknown };

/** Shared queries of the ArangoDB data sources. */
class BaseAPI {
  static collection: string | null = null;
  static edges: string[] = [];

  db: Database;
  protected _id_loader = new DataLoader<string, unknown>((ids) => this.get_ids(ids));

  constructor(db: Database) {
    this.db = db;
  }

  async get_ids(ids: readonly string[], db = this.db) {
    const cursor = await db.query(aql`
        FOR id IN ${ids}
            RETURN Document(id)
        `);
    return cursor.all();
  }

  async _search(collection: string, value: AqlValue, field: string, limit = 1): Promise<Document[]> {
    const cursor = await this.db.query(aql`
        FOR n IN ${this.db.collection(collection)}
            FILTER n.${field} == ${value}
            LIMIT ${limit}
            RETURN n
        `);
    const data = await cursor.all();
    return data.map((doc) => this.reducer(doc) as Document);
  }

  async get_id(id: string) {
    return this.reducer((await this._id_loader.load(id)) as Record<string, unknown> | null);
  }

  /** Renames `_id` to `id` and drops `_key`. */
  reducer(doc: Record<string, unknown> | null | undefined) {
    if (!doc) return doc;
    const { _id, _key, ...obj } = doc;
    return { id: _id, ...obj };
  }

  async _create(collection: string, data: Record<string, unknown>) {
    const res = await this.db.collection(collection).save(data);
    return { ...data, id: res._id };
  }

  async link(from: string, to: string, edge_collection: string, obj: Record<string, unknown> = {}) {
    return this._create(edge_collection, { _from: from, _to: to, ...obj });
  }

  async set_fields(collection: string, id: string, fields: Record<string, unknown>) {
    if (typeof fields !== "object" || fields === null) throw new InvalidInputError("'fields' must be an object");
    const cursor = await this.db.query(aql`
        LET d = Document(${id})
        UPDATE d WITH ${fields} IN ${this.db.collection(collection)}
        RETURN NEW`);
    return this.reducer(await cursor.next());
  }

  static async ensureCollection(db: Database, name: string, edge = false) {
    const collection = db.collection(name);
    if (await collection.exists()) return;
    console.log(`Creating '${name}' collection...`);
    await collection.create({
      type: edge ? CollectionType.EDGE_COLLECTION : CollectionType.DOCUMENT_COLLECTION,
    });
  }

  static async onConnect(db: Database) {
    await Promise.all([
      ...(this.collection ? [this.ensureCollection(db, this.collection)] : []),
      ...this.edges.map((edge) => this.ensureCollection(db, edge, true)),
    ]);
  }
}

export default BaseAPI;
