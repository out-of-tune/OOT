import BaseService from "./BaseService";

class GraphService extends BaseService {
  getNodes(query) {
    let params = {
      query: query,
    };
    return this.post(
      `/apollo/`,
      params,
    ).then((response) => response.data);
  }
}
export default new GraphService();
