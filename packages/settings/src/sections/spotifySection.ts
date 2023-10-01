import { Field, Types } from "../blocks/field.js";
import { Section } from "../blocks/section.js";

class SpotifySection extends Section {
    clientId: string
    clientSecret: string
    scope: string
}

const spotifySection = new SpotifySection("Spotify", [
    new Field("clientId", Types.string, "Spotify Client ID for Client Credentials Authentication Flow", {envName: "SPOTIFY_CLIENT_ID"}),
    new Field("clientSecret", Types.string, "Spotify Client Secret for Client Credentials Authentication Flow", {envName: "SPOTIFY_CLIENT_SECRET", sensitive: true}),
    new Field("scope", Types.string, "Required scope for Spotify OAUTH", {envName: "SPOTIFY_SCOPE"}),
])

export default spotifySection