import BaseService from "./BaseService";

interface GraphQlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

/** Client for the Apollo GraphQL API. */
class GraphService extends BaseService {
  async getNodes<T = Record<string, unknown>>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.post<GraphQlResponse<T>>("/apollo/", {
      query,
      variables,
    });
    return response.data;
  }
}

export default new GraphService();
