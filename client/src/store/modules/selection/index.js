import actions from "./actions"
import mutations from "./mutations"

export const selection = {
    state: {
        selectedNodes: [],
        temporarySelectedNodes: [],
        modalOpen: false,
        selectedNodeIndex: 0
    },
    actions,
    mutations
}
export default selection