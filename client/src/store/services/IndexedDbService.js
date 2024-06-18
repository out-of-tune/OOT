import { isProxy, toRaw } from 'vue';
import { cloneDeep } from 'lodash'

class IndexedDbService {

  async openDb(name, store) {
    return new Promise((resolve, reject) => {
      let db
      const request = window.indexedDB.open(name, 1);
      request.onerror = (event) => {
        return reject(request.error.error);
      };
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db)
      };
      request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore(store, {
          keyPath: "name",
        });
      };
    })
  }

  async saveGraph(name, graphObject) {
    let db = await this.openDb("OUT_OF_TUNE_GRAPHS", "graphs")
    const rawGraph = cloneDeep(graphObject)
    db
      .transaction("graphs", "readwrite")
      .objectStore("graphs")
      .put({ graph: rawGraph, name });
  }

  async getGraph(name) {
    let db = await this.openDb("OUT_OF_TUNE_GRAPHS", "graphs")
    return new Promise((resolve, reject) => {
      if (!db) reject("couldn't load db")
      db
        .transaction("graphs", "readonly")
        .objectStore("graphs")
        .get(name).onsuccess = (event) => {
          return event.target.result
            ? resolve(event.target.result.graph)
            : reject(new Error("Graph not existing"));
        };
    });
  }

  async saveConfiguration(name, configuration) {
    let db = await this.openDb("OUT_OF_TUNE_CONFIGURATIONS", "configurations")
    const rawConfig = cloneDeep(configuration)
    db
      .transaction("configurations", "readwrite")
      .objectStore("configurations")
      .put({ configuration: rawConfig, name });
  }

  async getConfiguration(name) {
    let db = await this.openDb("OUT_OF_TUNE_CONFIGURATIONS", "configurations")
    return new Promise((resolve, reject) => {
      if (!db) reject("couldn't load db")
      db
        .transaction("configurations", "readonly")
        .objectStore("configurations")
        .get(name).onsuccess = (event) => {
          return event.target.result
            ? resolve(event.target.result.configuration)
            : reject(new Error("Configuration not existing"));
        };
    });
  }

  async deleteConfiguration(name) {
    let db = await this.openDb("OUT_OF_TUNE_CONFIGURATIONS")
    db
      .transaction("configurations", "readwrite")
      .objectStore("configurations")
      .delete(name);
  }

  async deleteGraph(name) {
    let db = await this.openDb("OUT_OF_TUNE_GRAPHS", graphs)
    db
      .transaction("graphs", "readwrite")
      .objectStore("graphs")
      .delete(name);
  }
}
export default new IndexedDbService();
