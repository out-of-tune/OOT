import actions from "./actions"
import mutations from "./mutations"

export const share = {
    state: {
        shareModalOpen: false,
        shareLink: process.env.VUE_APP_PROXY_URI
    },
    actions,
    mutations
}

export default share
