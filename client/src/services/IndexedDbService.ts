import { cloneDeep } from "lodash-es";
import { toRaw } from "vue";
import type { Configuration } from "@/types/configuration";
import type { GraphObject } from "@/types/graph";

const GRAPHS = { database: "OUT_OF_TUNE_GRAPHS", store: "graphs" } as const;
const CONFIGURATIONS = {
  database: "OUT_OF_TUNE_CONFIGURATIONS",
  store: "configurations",
} as const;

type StoreLocation = typeof GRAPHS | typeof CONFIGURATIONS;

function openDb({ database, store }: StoreLocation): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(database, 1);
    request.onerror = () =>
      reject(request.error ?? new Error(`Could not open ${database}`));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(store, { keyPath: "name" });
    };
  });
}

function toPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function put(location: StoreLocation, record: object): Promise<void> {
  const db = await openDb(location);
  try {
    await toPromise(
      db
        .transaction(location.store, "readwrite")
        .objectStore(location.store)
        .put(record),
    );
  } finally {
    db.close();
  }
}

async function get<T>(
  location: StoreLocation,
  name: string,
): Promise<T | undefined> {
  const db = await openDb(location);
  try {
    return await toPromise<T | undefined>(
      db
        .transaction(location.store, "readonly")
        .objectStore(location.store)
        .get(name),
    );
  } finally {
    db.close();
  }
}

async function remove(location: StoreLocation, name: string): Promise<void> {
  const db = await openDb(location);
  try {
    await toPromise(
      db
        .transaction(location.store, "readwrite")
        .objectStore(location.store)
        .delete(name),
    );
  } finally {
    db.close();
  }
}

/** Stores graphs and configurations in the browser, by name. */
class IndexedDbService {
  saveGraph(name: string, graphObject: GraphObject): Promise<void> {
    return put(GRAPHS, { graph: cloneDeep(toRaw(graphObject)), name });
  }

  async getGraph(name: string): Promise<GraphObject> {
    const record = await get<{ graph: GraphObject }>(GRAPHS, name);
    if (!record) throw new Error("Graph not existing");
    return record.graph;
  }

  deleteGraph(name: string): Promise<void> {
    return remove(GRAPHS, name);
  }

  saveConfiguration(name: string, configuration: Configuration): Promise<void> {
    return put(CONFIGURATIONS, {
      configuration: cloneDeep(toRaw(configuration)),
      name,
    });
  }

  async getConfiguration(name: string): Promise<Configuration> {
    const record = await get<{ configuration: Configuration }>(
      CONFIGURATIONS,
      name,
    );
    if (!record) throw new Error("Configuration not existing");
    return record.configuration;
  }

  deleteConfiguration(name: string): Promise<void> {
    return remove(CONFIGURATIONS, name);
  }
}

export default new IndexedDbService();
