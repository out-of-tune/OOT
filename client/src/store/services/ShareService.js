import BaseService from "./BaseService";

class ShareService extends BaseService {
  getShareLink(type, object) {
    let params = {
      object,
    };
    return this.post("/share/" + type + "/create", params, {
      "Content-Type": "application/json",
    });
  }
  getSharedObject(uri) {
    return this.get("/share/" + uri, {});
  }
}
export default new ShareService();
