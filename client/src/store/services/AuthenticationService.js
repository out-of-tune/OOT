import axios from "axios";
import { PROXY_URI } from "../../settings";

class AuthenticationService {
  constructor() {
    this.api = `${PROXY_URI}/auth`;
  }
  getFromAPI(url, params = null, headers = {}) {
    let config = {};
    if (params) {
      config.params = params;
    }
    config.headers = {
      "Content-Type": "application/json",
      ...headers,
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

  post(url, params = null, headers = {}) {
    let config = {};
    if (params) {
      config.params = params;
    }
    config.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
    return new Promise((resolve, reject) => {
      axios
        .post(this.api + url, {}, config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  get_oauth2_login_page(url = "/oauth2/spotify") {
    const result = this.getFromAPI(url);
    return result;
  }

  login(url, headers = {}) {
    const result = this.post(url, null, headers);
    return result;
  }
  refreshToken(refreshToken, url = `/oauth2/spotify`) {
    return this.getFromAPI(`${url}/refresh`, { refresh_token: refreshToken });
  }
}
export default new AuthenticationService();
