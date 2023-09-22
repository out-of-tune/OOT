<template>
  <div>
    <!-- The Modal -->
    <div v-if="open" id="myModal" class="modal">
      <!-- Modal content -->
      <div class="card">
        <v-icon
          dark
          @click="changePlaylistLoaderState(false)"
          class="close"
          icon="mdi-close"
        />
        <div class="playlist-box" v-if="loggedIn">
          <div>
            <h2>Your playlists</h2>
            <label class="label">filter playlists:</label>
            <input type="text" class="textfield" v-model="filterQuery" />
            <ul @click="setCurrentPlaylist" class="playlists">
              <li
                v-for="playlist in filteredPlaylists"
                :key="playlist.name"
                class="playlist-item"
              >
                {{ playlist.name }}
              </li>
            </ul>
          </div>
          <div>
            <h2>current Playlist</h2>
            {{ currentPlaylist.name }}
            <button class="btn" @click="loadMore()">load more</button>
            <button
              class="btn"
              @click="loadPlaylistFromUser(currentPlaylist.id)"
            >
              load playlist
            </button>
          </div>
        </div>
        <div v-else class="login-box">
          <div class="content">
            <h1>You have to be logged in to Spotify to access playlists</h1>
            <button
              class="btn"
              v-if="!loggedIn"
              id="login"
              outline
              color="#ffffff"
              v-on:click="loginUser"
            >
              login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data: () => ({
    uriString: "",
    filterQuery: "",
  }),
  computed: {
    ...mapState({
      open: (state) => state.playlists.playlistLoaderOpen,
      playlists: (state) => state.playlists.playlists,
      currentPlaylist: (state) => state.playlists.currentPlaylist,
      loggedIn: (state) => state.authentication.loginState,
    }),
    filteredPlaylists: {
      get() {
        return this.playlists.filter((item) =>
          item.name.match(this.filterQuery),
        );
      },
    },
  },
  methods: {
    ...mapActions([
      "changePlaylistLoaderState",
      "setCurrentPlaylist",
      "getCurrentUsersPlaylists",
      "loadMoreCurrentUsersPlaylists",
      "loadPlaylist",
      "login",
    ]),
    loadPlaylistFromUri(uriString) {
      const splitString = uriString.split(":");
      this.loadPlaylist(splitString[splitString.length - 1]);
    },
    loadPlaylistFromUser(playlistId) {
      this.loadPlaylist(playlistId);
    },
    loginUser() {
      this.login();
    },
    loadMore() {
      this.loadMoreCurrentUsersPlaylists();
    },
  },
  mounted: function () {
    if (this.$store.state.authentication.loginState) {
      this.getCurrentUsersPlaylists();
    }
  },
};
</script>
<style scoped>
/* The Modal (background) */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 100; /* Sit on top */
  padding-top: 10%; /* Location of the box */
  padding-left: 10%;
  padding-right: 10%;
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto;
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.card {
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;

  margin: 0.5rem;
  overflow-y: auto;
  height: 80%;
}
.close {
  grid-area: actions;
  position: sticky;
  top: 0;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  cursor: pointer;
  float: right;
  border-radius: 2px 0 0 0;
  box-shadow: -1px -1px -13px -6px rgba(0, 0, 0, 1);
}

.playlist-box {
  display: grid;
  grid-template-columns: 400px 1fr;
  margin: 1rem;
  grid-gap: 1rem;
}

.login-box {
  min-width: 30rem;
  min-height: 20rem;
  display: grid;
}
.content {
  align-self: center;
  justify-self: center;
  display: grid;
}
.playlists {
  height: 200px;
}
.textfield {
  color: white;
  border: 1px solid white;
  background-color: #454545;
}
.label {
  background-color: #454545;
  padding: 0.25rem;
  margin-right: 0.25rem;
}
.playlist-item {
  cursor: pointer;
}

.playlist-item:hover {
  color: #f2994a;
}
</style>
