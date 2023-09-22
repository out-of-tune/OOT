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
      `/${process.env.VUE_APP_APOLLO_HOST}/`,
      params,
      graphQlToken,
    ).then((response) => response.data);
  }
}
export default new SpotifyTokenService();
