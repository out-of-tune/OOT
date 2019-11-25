
const SET_MESSAGE = (state, message)=>{
    state.message = message
}
const SET_SNACK_COLOR = (state, color)=>{
    state.color = color
}
export const mutations = {
    SET_MESSAGE,
    SET_SNACK_COLOR,
}
export default mutations