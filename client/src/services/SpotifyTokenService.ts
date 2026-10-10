import BaseService from "./BaseService";

export interface PublicTokenResponse {
  publicToken: { token: string };
}

/** Gets the public (client credentials) Spotify token from the API. */
class SpotifyTokenService extends BaseService {
  async getAccessToken(): Promise<PublicTokenResponse> {
    const response = await this.post<{ data: PublicTokenResponse }>(
      "/apollo/",
      {
        query: "{ publicToken { token } }",
      },
    );
    return response.data;
  }
}

export default new SpotifyTokenService();
