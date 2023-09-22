<template>
  <div>
    <div v-if="open" id="playlistChooser" class="modal">
      <div class="card">
        <v-icon @click="changePlaylistChooserState(false)" icon="mdi-close" />
        <div class="playlist-box" v-if="loggedIn">
          <div>
            <h2>PLAYLISTS</h2>
            <PaginatedList
              :listData="playlists"
              columnOnePath="playlist.name"
              :itemStyle="{
                display: 'grid',
                'grid-template-columns': '1fr 1fr',
                paddingBottom: '0.5rem',
              }"
              :itemClick="setCurrentPlaylist"
            ></PaginatedList>
          </div>
          <div>
            <h2>Playlist</h2>
            {{ currentPlaylist.name }}
            <button small @click="addToPlaylist">add to playlist</button>
          </div>
        </div>
        <div v-else class="login-box">
          <div class="content">
            <h1>You have to be logged in to Spotify to access playlists</h1>
            <button
              small
              v-if="!loggedIn"
              id="login"
              outline
              color="#ffffff"
              v-on:click="login"
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
import PaginatedList from "@/components/helpers/PaginatedList";
import { mapState, mapActions } from "vuex";
export default {
  components: {
    PaginatedList,
  },
  computed: {
    ...mapState({
      open: (state) => state.playlists.playlistChooserOpen,
      playlists: (state) => state.playlists.playlists,
      currentPlaylist: (state) => state.playlists.currentPlaylist,
      selectedNodes: (state) => state.selection.selectedNodes,
      loggedIn: (state) => state.authentication.loginState,
    }),
  },
  methods: {
    ...mapActions([
      "changePlaylistChooserState",
      "setCurrentPlaylist",
      "getCurrentUsersPlaylists",
      "addSongsToPlaylist",
      "login",
    ]),
    async addToPlaylist() {
      const songs = this.selectedNodes
        .filter((node) => node.data.label === "song")
        .map((node) => node.data.uri);
      await this.addSongsToPlaylist(songs);
      this.changePlaylistChooserState(false);
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
  /* overflow: auto; Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.card {
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;

  margin: 0.5rem;
  overflow-y: auto;
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
  grid-template-columns: 1fr 0.3fr;
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
</style>
