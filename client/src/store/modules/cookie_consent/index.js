import actions from './actions.js'
import mutations from './mutations.js'

export const cookie_consent = {
    state: {
        cookieStatus: "deny"
    },
    actions,
    mutations
}

export default cookie_consent