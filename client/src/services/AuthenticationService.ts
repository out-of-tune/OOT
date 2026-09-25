import axios from "axios";

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/** Client for the OAuth service (`/auth`). */
class AuthenticationService {
  private readonly http = axios.create({
    baseURL: `${import.meta.env.VITE_PROXY_URI}`,
    timeout: 3000,
    headers: { "Content-Type": "application/json" },
  });

  /** Returns the URL of the Spotify login page. */
  async get_oauth2_login_page(): Promise<string> {
    const result = await this.http.get<string>("/auth/oauth2/spotify");
    return result.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const result = await this.http.get<RefreshTokenResponse>(
      "/auth/oauth2/spotify/refresh",
      {
        params: { refresh_token: refreshToken },
      },
    );
    return result.data;
  }
}

export default new AuthenticationService();
