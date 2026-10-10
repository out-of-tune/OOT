import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import type { Song } from "@/types/spotify";
import actions from "./actions";
import mutations from "./mutations";

export interface MusicPlayerState {
  currentSong: Song;
  queue: Song[];
  queueIndex: number;
  /** Action that runs when the user clicks a song node. */
  songAction: "playSong" | "addToQueue";
  /** Follow mode: the view moves to the node of the song that plays. */
  followPlayback: boolean;
}

export const emptySong = (): Song => ({
  name: "",
  images: [],
  preview_url: "",
});

export const music_player: Module<MusicPlayerState, RootState> = {
  state: () => ({
    currentSong: emptySong(),
    queue: [],
    queueIndex: 0,
    songAction: "playSong",
    followPlayback: false,
  }),
  actions,
  mutations,
};

export default music_player;
