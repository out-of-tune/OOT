import actions from "./actions"
import mutations from "./mutations"

export const appearance = {
    actions,
    mutations,
    state: {
        pendingRequestCount: 0,
        highlight: false
    }
}

export default appearance
