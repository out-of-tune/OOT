# Plan: Spotify login and a full Spotify player

The music player plays 30 second previews. Spotify no longer gives previews to new apps, so the player is mostly silent. This plan replaces it with the Spotify Web Playback SDK: the browser tab becomes a Spotify device that plays full tracks. The login is reworked first, because the player needs a session that survives a reload.

## 1. Login

Problems now:

- The auth service puts the access token and the refresh token in the URL (`/#/login?access_token=...`). URLs end up in the browser history.
- No code saves the refresh token, so a reload logs the user out.

New flow:

1. The client asks `/auth/oauth2/spotify` for the Spotify login URL. The auth service sets a random `state` cookie (unchanged).
2. After the login, the callback checks `state` and exchanges the code for tokens.
3. The auth service keeps the refresh token in an httpOnly cookie. JavaScript cannot read it. The redirect to the client carries no token: `/#/login?status=success`.
4. The client calls `/auth/oauth2/spotify/refresh`. The auth service reads the cookie, asks Spotify for a new access token and returns it. If Spotify sends a new refresh token, the cookie gets it.
5. On every page load the client calls the same endpoint. With a valid cookie the user is logged in again. Without one, the client uses the public token as before.
6. `POST /auth/oauth2/spotify/logout` deletes the cookie. The app no longer opens the Spotify logout page, which logged the user out of Spotify everywhere.

The login asks for these scopes:

```
streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify user-top-read user-read-recently-played user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private
```

## 2. Player

The Web Playback SDK needs Spotify Premium and a browser with DRM (Widevine). The app keeps the preview player for users without Premium and for visitors who are not logged in.

| Feature | Spotify Web API or SDK call |
| --- | --- |
| This tab as a device | SDK `Spotify.Player`, `ready` event gives the device id |
| Play, pause, next, previous, seek, volume | SDK `togglePlay`, `nextTrack`, `previousTrack`, `seek`, `setVolume` |
| Live track, progress, cover | SDK `player_state_changed` |
| Shuffle and repeat | `PUT /me/player/shuffle`, `PUT /me/player/repeat` |
| Devices and transfer | `GET /me/player/devices`, `PUT /me/player` |
| Like the current track | `GET /me/tracks/contains`, `PUT` and `DELETE /me/tracks` |
| Spotify queue | `GET /me/player/queue`, `POST /me/player/queue` |
| Play a song node | `PUT /me/player/play` with the track URI |
| Play an artist, album or playlist | `PUT /me/player/play` with the context URI |
| Load top artists, liked songs, recently played into the graph | `GET /me/top/artists`, `GET /me/tracks`, `GET /me/player/recently-played` |
| Follow an artist | `PUT /me/following` |

## 3. Structure

- `services/SpotifyService.ts` gets the new Web API calls.
- `lib/spotifyPlayer.ts` loads the SDK script and wraps the SDK player. It knows nothing about Vuex.
- A store module `spotify_player` holds the player state and the actions. The SDK player object stays outside the store.
- If the SDK is ready, `MusicPlayer.vue` shows the Spotify controls. Else it shows the preview controls.

## 4. Checks

- Unit tests for the auth endpoints (cookie set, refresh from the cookie, logout) and for the store actions with a mocked SDK.
- Manual test with a Premium account. The login and the SDK need a real Spotify account, which only the user can use.
