import BaseService from "./BaseService";

class GraphService extends BaseService {
  getNodes(query, token) {
    let params = {
      query: query,
    };
    return this.post(
      `/${process.env.VUE_APP_APOLLO_HOST}/`,
      params,
      token,
    ).then((response) => response.data);
  }
}
export default new GraphService();
