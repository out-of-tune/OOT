const setError = ({ dispatch }, error) => {
    dispatch('setSnackColor', 'error')
    dispatch('setMessage', error.message)
}
const setInfo = ({ dispatch }, message) => {
    dispatch('setSnackColor', 'info')
    dispatch('setMessage', message)
}
const setSuccess = ({ dispatch }, message) => {
    dispatch('setSnackColor', 'success')
    dispatch('setMessage', message)
}
const setMessage = ({ commit }, message)=>{
    commit('SET_MESSAGE', message)
}
const setSnackColor = ({ commit }, color)=>{
    commit('SET_SNACK_COLOR', color)
}
export const actions = {
    setError,
    setInfo,
    setSuccess,
    setMessage,
    setSnackColor,
}
export default actions