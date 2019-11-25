class IndexedDbService {
    saveGraph(name, graphObject) {
        try {
            const request = window.indexedDB.open('OUT_OF_TUNE_GRAPHS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result
                const transaction = this.db.transaction('graphs', 'readwrite')
                transaction.onerror = function (event) {
                    throw new Error("AN ERROR OCCURED")
                };
                transaction.onabort = function (event) {
                    throw new Error("AN ERROR OCCURED")
                };
                const graphStore = transaction.objectStore('graphs')
                graphStore.put({ graph: graphObject, name });


            }
            request.onerror = function (event) {
                throw new Error("AN ERROR OCCURED")
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('graphs', { keyPath: 'name' })
            }
        }
        catch (e) {
            throw e
        }

    }
    async getGraph(name) {
        return new Promise((resolve,reject) => {
            const request = window.indexedDB.open('OUT_OF_TUNE_GRAPHS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result;
                const transaction = this.db.transaction('graphs', 'readonly')
                transaction.onerror = function (event) {
                    return reject(transaction.error)
                }
                transaction.onabort = function (event) {
                    return reject(transaction.error)
                }
                const graphStore = transaction.objectStore('graphs')
                graphStore.get(name).onsuccess = function (event) {
                    return event.target.result? resolve(event.target.result.graph): reject(new Error("Graph not existing"))
                }
            }
            request.onerror = function (event) {
                return reject(request.error.error)
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('graphs', { keyPath: 'name' })
                this.store.createIndex('graph', 'graph', { unique: false })
            }
        })
    }

    saveConfiguration(name, configuration) {
        try {
            const request = window.indexedDB.open('OUT_OF_TUNE_CONFIGURATIONS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result
                const transaction = this.db.transaction('configurations', 'readwrite')
                transaction.onerror = function (event) {
                    throw new Error("AN ERROR OCCURED")
                }
                transaction.onabort = function (event) {
                    throw new Error("AN ERROR OCCURED")
                }
                const graphStore = transaction.objectStore('configurations')
                graphStore.put({ configuration, name })

            }
            request.onerror = function (event) {
                throw new Error("AN ERROR OCCURED")
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('configurations', { keyPath: 'name' })
            }
        }
        catch (e) {
            throw e
        }

    }
    async getConfiguration(name) {
        return new Promise((resolve,reject) => {
            const request = window.indexedDB.open('OUT_OF_TUNE_CONFIGURATIONS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result
                const transaction = this.db.transaction('configurations', 'readonly')
                transaction.onerror = function (event) {
                    return reject(transaction.error)
                }
                transaction.onabort = function (event) {
                    return reject(transaction.error)
                }
                const configurationStore = transaction.objectStore('configurations')
                configurationStore.get(name).onsuccess = function (event) {
                    return event.target.result? resolve(event.target.result.configuration): reject(new Error("Configuration not existing"))
                }
            }
            request.onerror = function (event) {
                return reject(request.error.error)
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('configurations', { keyPath: 'name' })
            }
        })
    }

    deleteConfiguration(name) {
        try {
            const request = window.indexedDB.open('OUT_OF_TUNE_CONFIGURATIONS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result
                const transaction = this.db.transaction('configurations', 'readwrite')
                transaction.onerror = function (event) {
                    throw new Error("AN ERROR OCCURED")
                }
                transaction.onabort = function (event) {
                    throw new Error("AN ERROR OCCURED")
                }
                const graphStore = transaction.objectStore('configurations')
                graphStore.delete(name)

            }
            request.onerror = function (event) {
                throw new Error("AN ERROR OCCURED")
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('configurations', { keyPath: 'name' })
            }
        }
        catch (e) {
            throw e
        }
    }
    deleteGraph(name) {
        try {
            const request = window.indexedDB.open('OUT_OF_TUNE_GRAPHS', 1);
            request.onsuccess = function (event) {
                this.db = event.target.result
                const transaction = this.db.transaction('graphs', 'readwrite')
                transaction.onerror = function (event) {
                    throw new Error("AN ERROR OCCURED")
                };
                transaction.onabort = function (event) {
                    throw new Error("AN ERROR OCCURED")
                };
                const graphStore = transaction.objectStore('graphs')
                graphStore.delete(name);
            }
            request.onerror = function (event) {
                throw new Error("AN ERROR OCCURED")
            }
            request.onupgradeneeded = function (event) {
                this.db = event.target.result
                this.store = this.db.createObjectStore('graphs', { keyPath: 'name' })
            }
        }
        catch (e) {
            throw e
        }

    }
}
export default new IndexedDbService()
