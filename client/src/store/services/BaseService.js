import axios from "axios";

export default class BaseService {
  constructor() {
    this.api = `${import.meta.env.VITE_PROXY_URI}`;
  }
  post(url, params = null, headers = {}) {
    let config = {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Accept-Encoding": "gzip",
            ...headers,
          },
        };
    return new Promise((resolve, reject) => {
      axios
        .post(this.api + url, params, config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  get(url, params = null, headers = {}) {
    let config = {
          headers: {
            "Access-Control-Allow-Origin": "*",
            ...headers,
          },
          params,
        };
    return new Promise((resolve, reject) => {
      axios
        .get(this.api + url, config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
