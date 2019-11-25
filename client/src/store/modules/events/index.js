import actions from "./actions"
import mutations from "./mutations"


export const events = {
    state: {
        groupMoveActive: false,
        moveOriginPosition: undefined,
        originNodePositions: [],
        mousePaused: false,
        keysdown: {},
        multiSelectOverlay: null,
        graphOverlayMouseDown: false,
        wasPaused: false,
        showTour: true
    },
    actions,
    mutations
}

export default events
