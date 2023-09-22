import axios from "axios";

export default class BaseService {
  constructor() {
    this.api = `${process.env.VUE_APP_PROXY_URI}`;
  }
  post(url, params = null, token = null, headers = {}) {
    let config = token
      ? {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Accept-Encoding": "gzip",
            "Client-Authentication": token,
            ...headers,
          },
        }
      : {
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
  get(url, params = null, token = null, headers = {}) {
    let config = token
      ? {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Client-Authentication": token,
            ...headers,
          },
          params,
        }
      : {
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
