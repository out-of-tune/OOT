import BaseService from "./BaseService";

class SpotifyTokenService extends BaseService {
  getAccessToken() {
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
    ).then((response) => response.data);
  }
}
export default new SpotifyTokenService();
