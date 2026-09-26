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
  }),
  actions,
  mutations,
};

export default music_player;
