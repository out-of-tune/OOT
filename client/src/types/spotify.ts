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
