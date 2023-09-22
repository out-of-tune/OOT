import actions from "./actions";
import mutations from "./mutations";

export const snackbar = {
  state: {
    message: "",
    color: "info",
  },
  actions,
  mutations,
};
export default snackbar;
