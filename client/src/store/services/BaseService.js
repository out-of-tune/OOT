import axios from "axios";
import { PROXY_URI } from "../../settings";

export default class BaseService {
  constructor() {
    this.api = `${PROXY_URI}`;
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
