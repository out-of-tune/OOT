import axios from "axios";
import BaseService from "./BaseService";

export type ShareType = "graph" | "settings";

export interface ShareResponse {
  id: string;
  type: ShareType;
  uri: string;
}

/** Client for the share service (`/share`). */
class ShareService extends BaseService {
  getShareLink(type: ShareType, object: string): Promise<ShareResponse> {
    return this.post<ShareResponse>(`/share/${type}/create`, { object });
  }

  /** Returns the stored payload as text. The payload is never parsed as JSON. */
  async getSharedObject(uri: string): Promise<string> {
    const response = await axios.get<string>(`${this.api}/share/${uri}`, {
      responseType: "text",
      transformResponse: (data: string) => data,
    });
    return response.data;
  }
}

export default new ShareService();
