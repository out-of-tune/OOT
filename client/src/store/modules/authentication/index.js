import actions from "./actions";
import mutations from "./mutations";

export const authentication = {
  state: {
    accessToken: "",
    refreshToken: "",
    expiryTime: 10,
    loginState: false,
    clientAuthenticationToken: "",
  },
  actions,
  mutations,
};

export default authentication;
