import { PROXY_URI } from "../../../settings";
import actions from "./actions";
import mutations from "./mutations";

export const share = {
  state: {
    shareModalOpen: false,
    shareLink: PROXY_URI,
  },
  actions,
  mutations,
};

export default share;
