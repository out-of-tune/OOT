import axios from "axios";

/** HTTP client for the services behind the reverse proxy (`VITE_PROXY_URI`). */
export default class BaseService {
  protected readonly api = `${import.meta.env.VITE_PROXY_URI}`;

  async post<T = unknown>(
    url: string,
    body: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await axios.post<T>(this.api + url, body, {
      headers: { "Content-Type": "application/json", ...headers },
    });
    return response.data;
  }

  async get<T = unknown>(
    url: string,
    params: Record<string, unknown> | null = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await axios.get<T>(this.api + url, { headers, params });
    return response.data;
  }
}
