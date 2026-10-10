import { Database } from "arangojs";
import ArtistAPI from "./artist.js";
import FeedbackAPI from "./feedback.js";
import GenreAPI from "./genre.js";
import SourceAPI from "./source.js";
import { delay } from "../../helpers/delay.js";

/** Wait between connection attempts while the database starts, in milliseconds. */
const RETRY_DELAY = 5000;

const isConnectionRefused = (error: unknown) =>
  error instanceof Error && /ECONNREFUSED|fetch failed/.test(`${error.message} ${String(error.cause)}`);

/** The ArangoDB data sources of one request. */
class ArangoAPI {
  artist: ArtistAPI;
  genre: GenreAPI;
  source: SourceAPI;
  feedback: FeedbackAPI;

  constructor(db: Database) {
    this.artist = new ArtistAPI(db);
    this.genre = new GenreAPI(db);
    this.source = new SourceAPI(db);
    this.feedback = new FeedbackAPI(db);
  }

  /**
   * Connects to the database, creates it and its collections if they are missing,
   * and waits while the database server is not reachable yet.
   */
  static async connect(url: string, databaseName: string, username: string, password: string): Promise<Database> {
    const system = new Database({ url, databaseName: "_system", auth: { username, password } });
    for (;;) {
      try {
        const databases = await system.listDatabases();
        if (!databases.includes(databaseName)) await system.createDatabase(databaseName);
        const db = system.database(databaseName);
        await Promise.all([
          ArtistAPI.onConnect(db),
          GenreAPI.onConnect(db),
          SourceAPI.onConnect(db),
          FeedbackAPI.onConnect(db),
        ]);
        console.log("ArangoDB connected:", (await system.version()).version);
        return db;
      } catch (error) {
        if (!isConnectionRefused(error)) throw error;
        console.log(`ArangoDB is not reachable. Retrying in ${RETRY_DELAY / 1000}s...`);
        await delay(RETRY_DELAY);
      }
    }
  }
}

export default ArangoAPI;
