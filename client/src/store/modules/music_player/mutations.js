const SET_CURRENT_SONG = (state, song) => {
    state.currentSong = song
}

const SET_QUEUE_INDEX = (state, index) => {
    state.queueIndex = index
}

const ADD_TO_QUEUE = (state, song) => {
    state.queue.push(song)
}

const INSERT_IN_QUEUE = (state, {song, position}) => {
    state.queue.splice(position, 0, song)
}

const REMOVE_FROM_QUEUE = (state, queueIndex) => {
    state.queue.splice(queueIndex, 1)
}

const SET_QUEUE = (state,{queue, queueIndex}) => {
    state.queue = queue
    state.queueIndex = queueIndex
}

export const mutations = {
    SET_CURRENT_SONG,
    SET_QUEUE_INDEX,
    ADD_TO_QUEUE,
    INSERT_IN_QUEUE,
    REMOVE_FROM_QUEUE,
    SET_QUEUE
}

export default mutations