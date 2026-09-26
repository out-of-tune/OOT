import type { Module } from "vuex";
import type { RootState } from "@/store/types";
import type { RepeatState, SpotifyDevice, SpotifyImage } from "@/types/spotify";
import actions from "./actions";
import mutations from "./mutations";

/**
 * - off: not logged in, or not connected yet.
 * - connecting: the SDK loads.
 * - ready: this tab is a Spotify Connect device.
 * - premium_required: the account cannot stream (Spotify Free).
 * - unavailable: the browser cannot play (no DRM), or the SDK failed.
 */
export type SpotifyPlayerStatus =
  "off" | "connecting" | "ready" | "premium_required" | "unavailable";

export interface NowPlaying {
  id: string | null;
  uri: string;
  name: string;
  artists: { name: string; id?: string }[];
  albumName: string;
  images: SpotifyImage[];
  durationMs: number;
}

export interface SpotifyPlayerState {
  status: SpotifyPlayerStatus;
  /** Device id of this tab. */
  deviceId: string | null;
  /** True while this tab is the device that plays. */
  isLocal: boolean;
  /** Name of the device that plays, when it is another one. */
  remoteDeviceName: string | null;
  track: NowPlaying | null;
  paused: boolean;
  positionMs: number;
  /** Time (Date.now()) at which positionMs was measured. The UI moves the position on from it. */
  positionAt: number;
  shuffle: boolean;
  repeat: RepeatState;
  /** Volume in percent. */
  volume: number;
  liked: boolean;
  devices: SpotifyDevice[];
  queue: NowPlaying[];
}

export const initialSpotifyPlayerState = (): SpotifyPlayerState => ({
  status: "off",
  deviceId: null,
  isLocal: false,
  remoteDeviceName: null,
  track: null,
  paused: true,
  positionMs: 0,
  positionAt: 0,
  shuffle: false,
  repeat: "off",
  volume: 50,
  liked: false,
  devices: [],
  queue: [],
});

/** The position of the playback at time `now`: it moves on from `positionMs` while the song plays. */
export function playbackPosition(
  state: Pick<
    SpotifyPlayerState,
    "positionMs" | "positionAt" | "paused" | "track"
  >,
  now = Date.now(),
) {
  const elapsed = state.paused ? 0 : Math.max(now - state.positionAt, 0);
  return Math.min(
    state.positionMs + elapsed,
    state.track?.durationMs || Infinity,
  );
}

export const spotify_player: Module<SpotifyPlayerState, RootState> = {
  state: initialSpotifyPlayerState,
  actions,
  mutations,
};

export default spotify_player;
