import axios from "axios";

class AuthenticationService {
  constructor() {
    this.api = `${import.meta.env.VITE_PROXY_URI}`;
    console.log(this.api);
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
    alert(JSON.stringify(result));
    return result.data;
  }

  refreshToken(refreshToken) {
    return this.getFromAPI("/auth/oauth2/spotify/refresh", {
      refresh_token: refreshToken,
    });
  }
}
export default new AuthenticationService();
