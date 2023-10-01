import actions from "./actions";
import mutations from "./mutations";

export const share = {
  state: {
    shareModalOpen: false,
    shareLink: import.meta.env.VITE_PROXY_URI,
  },
  actions,
  mutations,
};

export default share;
