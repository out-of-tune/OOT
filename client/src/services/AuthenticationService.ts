import axios from "axios";

export interface AccessTokenResponse {
  access_token: string;
  /** Lifetime of the access token in seconds. */
  expires_in: number;
  scope?: string;
}

/**
 * Client for the OAuth service (`/auth`). The refresh token stays in an httpOnly cookie
 * that the auth service sets, so this client never sees it.
 */
class AuthenticationService {
  private readonly http = axios.create({
    baseURL: `${import.meta.env.VITE_PROXY_URI}/auth/oauth2/spotify`,
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  /** Returns the URL of the Spotify login page. */
  async get_oauth2_login_page(): Promise<string> {
    const result = await this.http.get<string>("/");
    return result.data;
  }

  /** New access token for the session cookie. Fails with 401 when the user is not logged in. */
  async refreshToken(): Promise<AccessTokenResponse> {
    const result = await this.http.get<AccessTokenResponse>("/refresh");
    return result.data;
  }

  async logout(): Promise<void> {
    await this.http.post("/logout");
  }
}

export default new AuthenticationService();
