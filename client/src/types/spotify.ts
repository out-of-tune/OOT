// Subset of the Spotify Web API objects that the app reads.

export interface SpotifyImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface SpotifyExternalUrls {
  spotify?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri?: string;
  images?: SpotifyImage[];
  popularity?: number;
  genres?: string[];
  external_urls?: SpotifyExternalUrls;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri?: string;
  images?: SpotifyImage[];
  artists?: Pick<SpotifyArtist, "id" | "name">[];
  release_date?: string;
  total_tracks?: number;
  external_urls?: SpotifyExternalUrls;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  preview_url?: string | null;
  duration_ms?: number;
  track_number?: number;
  artists?: Pick<SpotifyArtist, "id" | "name">[];
  album?: SpotifyAlbum;
  external_urls?: SpotifyExternalUrls;
}

export interface SpotifyPlaylistTrack {
  track: SpotifyTrack;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri?: string;
  images?: SpotifyImage[];
}

export interface SpotifyUser {
  id: string;
  display_name?: string;
  /** "premium" or "free". Full playback in the browser needs "premium". */
  product?: string;
  country?: string;
  images?: SpotifyImage[];
}

export interface SpotifyPage<T> {
  items: T[];
  limit: number;
  offset: number;
  next: string | null;
  total?: number;
}

export interface SpotifySearchResult {
  artists?: SpotifyPage<SpotifyArtist>;
  albums?: SpotifyPage<SpotifyAlbum>;
  tracks?: SpotifyPage<SpotifyTrack>;
}

/** A song in the player queue: track data plus the cover images. */
export interface Song {
  id?: string;
  name: string;
  uri?: string;
  preview_url?: string | null;
  images: SpotifyImage[];
  artists?: Pick<SpotifyArtist, "id" | "name">[];
  [key: string]: unknown;
}

export type RepeatState = "off" | "context" | "track";

export interface SpotifyDevice {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
  is_restricted: boolean;
  volume_percent: number | null;
}

/** GET /me/player */
export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  is_playing: boolean;
  progress_ms: number | null;
  shuffle_state: boolean;
  repeat_state: RepeatState;
  item: SpotifyTrack | null;
  timestamp: number;
}

export interface SpotifyQueue {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
}

export interface StartPlaybackOptions {
  deviceId?: string;
  uris?: string[];
  contextUri?: string;
  /** Start at this position of the list or the context. */
  offset?: { position: number } | { uri: string };
  positionMs?: number;
}
