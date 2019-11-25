import SpotifyService from '@/store/services/SpotifyService'
import { handleTokenError } from '@/assets/js/TokenHelper.js'
import {getAllNodes} from "@/assets/js/graphHelper.js"

const getSongSamples = async ({commit, rootState, dispatch}, node) => {
    const fetchData = node.data.label==="artist"
    ? (sid, token)=>{
        return [SpotifyService.getSongSamplesFromArtist(token, sid)]
    }
    : (sid, token)=>{
        return [SpotifyService.getSongsFromAlbum(token, sid)]
    }

    const result = await handleTokenError(fetchData, [node.data.sid], dispatch, rootState)
    const tracks = node.data.label === "artist"? result[0].tracks: result[0].items
    commit('ADD_NODE_DATA', {node, data: {tracks}})
}

const setCurrentSong = ({ commit }, song) => {
    commit('SET_CURRENT_SONG', song)
}

const insertInQueue = ({ commit }, { song, position }) => {
    commit('INSERT_IN_QUEUE', { song, position })
}

const playSong = ({ dispatch, state }, song) => {
    const currentQueuePosition = (state.queue.length == 0) ? 0 : state.queueIndex+1
    dispatch('insertInQueue', { song, position: currentQueuePosition})
    dispatch('playAtIndexInQueue', currentQueuePosition)
}

const addToQueue = ({ commit }, song) => {
    commit('ADD_TO_QUEUE', song)
}

const playNextInQueue = ({ dispatch, state }) => {
    if (state.queue.length > state.queueIndex+1) {
        dispatch("playAtIndexInQueue",state.queueIndex+1)
    }
}

const playPreviousInQueue = ({ dispatch, state }) => {
    if (state.queueIndex > 0) {
        dispatch("playAtIndexInQueue",state.queueIndex-1)
    }
}

const playAtIndexInQueue = ({ commit, state }, index) => {
    if(index>=0 && index<state.queue.length){
        commit('SET_CURRENT_SONG', state.queue[index])
        commit('SET_QUEUE_INDEX', index)
    }
}

const retrieveFullSongData = async ( dispatch, rootState, node) => {
    function fetchData(sid, token){
        return SpotifyService.getFullSongData(token, sid)
    }
    const result = await handleTokenError(fetchData, [[node.data.sid]], dispatch, rootState)
    return {node: node, data: {...result.tracks[0], images:result.tracks[0].album.images }}

}

const songAction = async ({ dispatch, state, rootState, commit }, node) => {
    const updatedNode = await retrieveFullSongData(dispatch, rootState, node)
    commit('ADD_NODE_DATA', updatedNode)
    dispatch(state.songAction, updatedNode.data)
}

const removeFromQueue = ({ commit }, queueIndex) => {
    commit('REMOVE_FROM_QUEUE', queueIndex)
}

const setQueue = ({commit}, {queue, queueIndex}) => {
    commit('SET_QUEUE', {queue, queueIndex})
}

const setQueueVisibility = ({commit}, visible) => {
    commit("SET_QUEUE_VISIBILITY", visible)
}

const setNodeInfoVisibility = ({commit}, visible) => {
    commit("SET_NODEINFO_VISIBILITY", visible)
}

const playOnSpotify = ({ rootState }, uris) => {
    if(rootState.authentication.loginState){
        SpotifyService.play(rootState.authentication.accessToken, uris)
    }
}

export const actions = {
    getSongSamples,
    setCurrentSong,
    addToQueue,
    playNextInQueue,
    playPreviousInQueue,
    insertInQueue,
    playSong,
    playAtIndexInQueue,
    songAction,
    retrieveFullSongData,
    removeFromQueue,
    setQueueVisibility,
    setNodeInfoVisibility,
    setQueue,
    playOnSpotify
}

export default actions