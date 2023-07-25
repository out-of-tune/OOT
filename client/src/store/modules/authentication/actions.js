import SpotifyTokenService from '@/store/services/SpotifyTokenService'
import AuthenticationService from '@/store/services/AuthenticationService'

const login = async () => {
    const result = await AuthenticationService.get_oauth2_login_page()
    window.location.href = result
}

const setLoginState = ({ commit }, loggedIn)=>{
    commit('SET_LOGIN_STATE', loggedIn)
}

const refreshTokenAfterTimeout = async ({ state, dispatch }) => {
    setTimeout(async ()=>{
       dispatch('refreshToken')
    }, state.expiryTime * 1000 - 5000)
}

const refreshToken = async ({ state, dispatch }) => {
    const result = await AuthenticationService.refreshToken(state.refreshToken)
    dispatch('setAccessToken', result.access_token)
}

const setAccessToken = ({ commit, dispatch }, token) => {
    commit('SET_ACCESS_TOKEN', token)
    dispatch('setLoginState', true)
    dispatch('refreshTokenAfterTimeout')
}

const setRefreshToken = ({ commit }, token) => {
    commit('SET_REFRESH_TOKEN', token)
}

const setExpiryTime = ({ commit }, time) => {
    commit('SET_EXPIRY_TIME', time)
}

const requireAccessToken = async ({ commit, rootState }) => {
    const result = await SpotifyTokenService.getAccessToken(rootState.authentication.clientAuthenticationToken)
    const spotifyAccessToken = result.publicToken.token
    commit('SET_SPOTIFY_ACCESS_TOKEN', spotifyAccessToken)
    return result
}

const logout = ({ dispatch, commit }) => {
    commit('DELETE_USER_STATE')
    dispatch('setLoginState', false)
    dispatch('deleteCurrentUser')
    dispatch('clearPlaylists')
    const url = 'https://accounts.spotify.com/en/logout'                                                                                                                                                                                                                                                                               
    const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
    setTimeout(() => spotifyLogoutWindow.close(), 200)

    dispatch('setInfo', 'Logged out')

}

const authenticateClient = async ({ commit, dispatch, rootState }) => {
    console.log(process.env)
    const key = Buffer.from(`${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`).toString('base64')

    try {
        const response = await AuthenticationService.login('/app/login', { 'App-Login': key })
        if(response.success){
            commit('SET_CLIENT_AUTHENTICATION_TOKEN', response.token.token)
        }else {
            dispatch('setError', new Error(response.message))
        }
        return response
    }
    catch(error){
        dispatch('setError', new Error("Could not authenticate the client! please refresh the webpage"))
    }
    return
}

export const actions = {
    login,
    setAccessToken,
    setRefreshToken,
    setExpiryTime,
    refreshToken,
    setLoginState,
    refreshTokenAfterTimeout,
    requireAccessToken,
    logout,
    authenticateClient
}

export default actions
