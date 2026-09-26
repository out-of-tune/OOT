import type { Database } from "arangojs";
import BaseAPI from "./base.js";

/** Origins of artist data. Spotify is `Source/0`. */
class SourceAPI extends BaseAPI {
  static collection = "Source";

  static async onConnect(db: Database) {
    await super.onConnect(db);
    const sources = new SourceAPI(db);
    const spotify = await sources.fetch("Spotify");
    if (spotify.length === 0) await sources.create("Spotify", "0");
  }

  create(name: string, _key: string) {
    return this._create("Source", { _key, name });
  }

  fetch(name: string) {
    return this._search("Source", name, "name", 1);
  }
}

export default SourceAPI;
