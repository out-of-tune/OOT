<template>
  <div>
    <!-- The Modal -->
    <div v-if="open" id="myModal" class="modal">
      <!-- Modal content -->
      <div class="card">
        <v-icon
          @click="changePlaylistLoaderState(false)"
          class="close"
          name="md-close"
        />
        <div class="playlist-box" v-if="loggedIn">
          <div>
            <h2>Your playlists</h2>
            <div class="playlists-header">
              <div>
                {{ playlists.length }}
                <button class="btn" @click="loadMore()">load more</button>
              </div>
              <div>
                <label class="label">filter playlists:</label>
                <input type="text" class="textfield" v-model="filterQuery" />
              </div>
            </div>
            <ul class="playlists">
              <li
                v-for="playlist in filteredPlaylists"
                :key="playlist.name"
                class="playlist-item"
                @click="() => playlistClickHandler(playlist)"
              >
                {{ playlist.name }}
              </li>
            </ul>
          </div>
          <div>
            <h2>selected Playlist</h2>
            <h3 v-if="selectedPlaylist">{{ selectedPlaylist.name }}</h3>
            <h3 v-else>no playlist selected</h3>
            <button class="btn" @click="loadPlaylistFromUser">
              load playlist graph
            </button>
            <button class="btn" @click="changeCurrentPlaylist">
              edit playlist
            </button>
          </div>
          <div>
            <h2>current Playlist to edit</h2>
            <h3 v-if="currentPlaylist">{{ currentPlaylist.name }}</h3>
            <h3 v-else>no playlist for editing selected</h3>
          </div>
        </div>
        <div v-else class="login-box">
          <div class="content">
            <h1>You have to be logged in to Spotify to access playlists</h1>
            <button
              class="btn"
              v-if="!loggedIn"
              id="login"
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
    selectedPlaylist: undefined,
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
    loadPlaylistFromUser() {
      this.loadPlaylist(this.selectedPlaylist.id);
    },
    loginUser() {
      this.login();
    },
    loadMore() {
      this.loadMoreCurrentUsersPlaylists();
    },
    playlistClickHandler(playlist) {
      this.selectedPlaylist = playlist;
    },
    changeCurrentPlaylist() {
      this.setCurrentPlaylist(this.selectedPlaylist);
      console.log(this.currentPlaylist.id);
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
  left: 0;
  top: 0;
  overflow: auto;
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */

  width: 100vw; /* Full width */
  height: 100vh; /* Full height */
}

@media screen and (min-width: 500px) {
  .modal {
    padding-top: 10vh; /* Location of the box */
    padding-left: 10vw;
    padding-right: 10vw;
    width: 80vw; /* Full width */
    height: 80vh; /* Full height */
  }
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
  display: flex;
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

.playlists-header {
  display: flex;
  flex-direction: column;
}
</style>
