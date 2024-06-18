import axios from "axios";

class AuthenticationService {
  constructor() {
    this.api = `${import.meta.env.VITE_PROXY_URI}`;
    this.http = axios.create({
      baseURL: this.api,
      timeout: 3000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get_oauth2_login_page() {
    const result = await this.http.get("/auth/oauth2/spotify");
    return result.data;
  }

  async refreshToken(refreshToken) {
    const result = await this.http.get("/auth/oauth2/spotify/refresh", {
      params: { refresh_token: refreshToken },
    });
    return result.data;
  }
}
export default new AuthenticationService();
