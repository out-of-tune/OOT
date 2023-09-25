import BaseService from "./BaseService";

class SpotifyTokenService extends BaseService {
  getAccessToken(graphQlToken) {
    let params = {
      query: `{
                publicToken {
                    token
                }
            }`,
    };
    return this.post(
      `/apollo/`,
      params,
      graphQlToken,
    ).then((response) => response.data);
  }
}
export default new SpotifyTokenService();
