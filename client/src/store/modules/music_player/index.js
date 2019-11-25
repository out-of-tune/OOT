import actions from "./actions"
import mutations from "./mutations"

export const music_player = {
    state: {
        currentSong: {
            name: "",
            images: [],
            preview_url: ""
        },
        queue: [],
        queueIndex: 0,
        songAction: "playSong"
    },
    actions,
    mutations
}

export default music_player
