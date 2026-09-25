import type { MutationTree } from "vuex";
import type { RepeatState, SpotifyDevice } from "@/types/spotify";
import {
  initialSpotifyPlayerState,
  type NowPlaying,
  type SpotifyPlayerState,
  type SpotifyPlayerStatus,
} from "./index";

export interface PlaybackUpdate {
  track: NowPlaying | null;
  paused: boolean;
  positionMs: number;
  shuffle: boolean;
  repeat: RepeatState;
  isLocal: boolean;
  remoteDeviceName: string | null;
}

export const mutations = {
  SET_SPOTIFY_PLAYER_STATUS(state, status: SpotifyPlayerStatus) {
    state.status = status;
  },
  SET_SPOTIFY_DEVICE_ID(state, deviceId: string | null) {
    state.deviceId = deviceId;
  },
  SET_SPOTIFY_PLAYBACK(state, update: PlaybackUpdate) {
    Object.assign(state, update, { positionAt: Date.now() });
  },
  SET_SPOTIFY_PAUSED(state, paused: boolean) {
    state.paused = paused;
    state.positionAt = Date.now();
  },
  SET_SPOTIFY_POSITION(state, positionMs: number) {
    state.positionMs = positionMs;
    state.positionAt = Date.now();
  },
  SET_SPOTIFY_SHUFFLE(state, shuffle: boolean) {
    state.shuffle = shuffle;
  },
  SET_SPOTIFY_REPEAT(state, repeat: RepeatState) {
    state.repeat = repeat;
  },
  SET_SPOTIFY_VOLUME(state, volume: number) {
    state.volume = volume;
  },
  SET_SPOTIFY_LIKED(state, liked: boolean) {
    state.liked = liked;
  },
  SET_SPOTIFY_DEVICES(state, devices: SpotifyDevice[]) {
    state.devices = devices;
  },
  SET_SPOTIFY_QUEUE(state, queue: NowPlaying[]) {
    state.queue = queue;
  },
  RESET_SPOTIFY_PLAYER(state) {
    Object.assign(state, initialSpotifyPlayerState());
  },
} satisfies MutationTree<SpotifyPlayerState>;

export default mutations;
