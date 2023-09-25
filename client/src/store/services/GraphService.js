import BaseService from "./BaseService";

class GraphService extends BaseService {
  getNodes(query, token) {
    let params = {
      query: query,
    };
    return this.post(
      `/apollo/`,
      params,
      token,
    ).then((response) => response.data);
  }
}
export default new GraphService();
