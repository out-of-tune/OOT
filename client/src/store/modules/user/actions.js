import SpotifyService from '@/store/services/SpotifyService'

const getCurrentUser = async ({ commit, rootState }) => {
    if(rootState.authentication.loginState){
        const user = await SpotifyService.getCurrentUserProfile(rootState.authentication.accessToken)
        commit('SET_CURRENT_USER', user)
    }
    else {
        //console.log("not logged in")
    }
}

const deleteCurrentUser = ({ commit }) => {
    commit('SET_CURRENT_USER', {})
}

export const actions = {
    getCurrentUser,
    deleteCurrentUser
}

export default actions