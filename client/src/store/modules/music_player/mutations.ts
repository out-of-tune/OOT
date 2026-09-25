import type { MutationTree } from "vuex";
import type { Song } from "@/types/spotify";
import type { MusicPlayerState } from "./index";

export const mutations = {
  SET_CURRENT_SONG(state, song: Song) {
    state.currentSong = song;
  },
  SET_QUEUE_INDEX(state, index: number) {
    state.queueIndex = index;
  },
  ADD_TO_QUEUE(state, song: Song) {
    state.queue.push(song);
  },
  INSERT_IN_QUEUE(state, { song, position }: { song: Song; position: number }) {
    state.queue.splice(position, 0, song);
  },
  /** Removes a song and keeps the index on the song that plays. */
  REMOVE_FROM_QUEUE(state, queueIndex: number) {
    state.queue.splice(queueIndex, 1);
    if (queueIndex < state.queueIndex) state.queueIndex -= 1;
  },
  SET_QUEUE(
    state,
    { queue, queueIndex }: { queue: Song[]; queueIndex: number },
  ) {
    state.queue = queue;
    state.queueIndex = queueIndex;
  },
} satisfies MutationTree<MusicPlayerState>;

export default mutations;
