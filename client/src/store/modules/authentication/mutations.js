export const mutations = {
    SET_ACCESS_TOKEN(state, token) {
        state.accessToken = token;
    },

    SET_REFRESH_TOKEN(state, token) {
        state.refreshToken = token;
    },

    SET_EXPIRY_TIME(state, time) {
        state.expiryTime = time;
    },

    SET_LOGIN_STATE(state, loggedIn) {
        state.loginState = loggedIn
    },

    DELETE_USER_STATE(state) {
        state.accessToken = '',
        state.refreshToken = '',
        state.expiryTime = 10
    },

    SET_CLIENT_AUTHENTICATION_TOKEN(state, token) {
        state.clientAuthenticationToken = token
    }
}

export default mutations