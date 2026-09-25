/** Loads the Spotify Web Playback SDK and creates a player. It knows nothing about the store. */

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";
/** How long the SDK script may take to load, in milliseconds. */
const SDK_TIMEOUT = 15000;

let sdkLoading: Promise<SpotifySdk> | null = null;

/** Adds the SDK script once and resolves when the SDK is ready. */
export function loadSpotifySdk(): Promise<SpotifySdk> {
  if (window.Spotify) return Promise.resolve(window.Spotify);
  sdkLoading ??= new Promise<SpotifySdk>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("The Spotify player did not load")),
      SDK_TIMEOUT,
    );
    window.onSpotifyWebPlaybackSDKReady = () => {
      clearTimeout(timeout);
      if (window.Spotify) resolve(window.Spotify);
      else reject(new Error("The Spotify player did not load"));
    };
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      sdkLoading = null;
      reject(new Error("The Spotify player did not load"));
    };
    document.head.appendChild(script);
  });
  return sdkLoading;
}

export type PlayerErrorKind =
  "initialization" | "authentication" | "account" | "playback" | "autoplay";

export interface PlayerCallbacks {
  onReady(deviceId: string): void;
  onNotReady(deviceId: string): void;
  onState(state: SpotifySdkPlaybackState | null): void;
  onError(kind: PlayerErrorKind, message: string): void;
}

/**
 * Creates a Spotify Connect device named "out-of-tune" in this tab.
 * `getToken` is called whenever the SDK needs an access token.
 */
export async function createSpotifyPlayer(
  getToken: () => string,
  callbacks: PlayerCallbacks,
  volume: number,
): Promise<SpotifySdkPlayer> {
  const sdk = await loadSpotifySdk();
  const player = new sdk.Player({
    name: "out-of-tune",
    getOAuthToken: (callback) => callback(getToken()),
    volume,
  });
  player.addListener("ready", ({ device_id }) => callbacks.onReady(device_id));
  player.addListener("not_ready", ({ device_id }) =>
    callbacks.onNotReady(device_id),
  );
  player.addListener("player_state_changed", (state) =>
    callbacks.onState(state),
  );
  player.addListener("initialization_error", ({ message }) =>
    callbacks.onError("initialization", message),
  );
  player.addListener("authentication_error", ({ message }) =>
    callbacks.onError("authentication", message),
  );
  player.addListener("account_error", ({ message }) =>
    callbacks.onError("account", message),
  );
  player.addListener("playback_error", ({ message }) =>
    callbacks.onError("playback", message),
  );
  player.addListener("autoplay_failed", () =>
    callbacks.onError("autoplay", "The browser blocked autoplay"),
  );
  const connected = await player.connect();
  if (!connected) throw new Error("The Spotify player could not connect");
  return player;
}
