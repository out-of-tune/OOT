<template>
  <div class="card">
    <div class="close">
      <span id="label">queue</span>
      <div id="queueIcons">
        <v-icon
          id="play-icon"
          v-if="loginState"
          @click="play"
          size="1.5rem"
          color="green"
          title="play this queue on Spotify"
          name="md-playlistplay"
          class="clickable"
        />
        <v-icon
          id="delete-icon"
          @click="clearQueue"
          size="1.5rem"
          color="white"
          name="md-playlistremove"
          title="clear queue"
          class="clickable"
        />
        <v-icon
          id="close-icon"
          @click="closeWindow"
          size="1.5rem"
          color="white"
          title="close window"
          name="md-close"
          class="clickable"
        />
      </div>
      <div id="spacer"></div>
    </div>

    <draggable :list="queue" @change="onMove" v-if="queue.length > 0">
      <template #item="{ element, index }">
        <li
          class="song"
          :class="{ playing: index === queueIndex }"
          @click="playSong(index)"
        >
          <button class="icon-btn" @click="removeFromQueue(index)">
            <v-icon color="white" name="md-remove" />
          </button>
          <div>
            {{ element.name }}
          </div>
          <button
            v-if="loginState"
            class="btn add-to-playlist"
            @click="addSongToCurrentPlaylist(index)"
          >
            <v-icon name="md-playlistadd" />
          </button>
        </li>
      </template>
    </draggable>
    <h2 v-else>Nothing in queue!</h2>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import { mapActions, mapState } from "vuex";

export default {
  components: {
    draggable,
  },
  methods: {
    ...mapActions([
      "playAtIndexInQueue",
      "addSongToPlaylist",
      "removeFromQueue",
      "setQueueVisibility",
      "setQueue",
      "playOnSpotify",
    ]),
    ...mapState({
      queue: (state) => state.queue,
    }),
    closeWindow: function () {
      this.setQueueVisibility(false);
    },
    onMove: function ({ moved }) {
      if (moved.oldIndex == this.queueIndex) {
        this.setQueue({ queue: this.queue, queueIndex: moved.newIndex });
      }
    },
    clearQueue: function () {
      this.setQueue({ queue: [], queueIndex: 0 });
    },
    play: function () {
      const uris = this.queue.map((track) => track.uri);
      this.playOnSpotify(uris);
    },
    playSong(index) {
      this.playAtIndexInQueue(index);
    },
    addSongToCurrentPlaylist(index) {
      const song = this.queue[index];
      console.log(song);
      this.addSongToPlaylist(song);
    },
  },
  computed: {
    ...mapState({
      queueIndex: (state) => state.music_player.queueIndex,
      loginState: (state) => state.authentication.loginState,
    }),
    queue: {
      get() {
        return this.$store.state.music_player.queue;
      },
      set(value) {
        this.setQueue({ queue: this.queue, queueIndex: this.queueIndex });
      },
    },
  },
};
</script>

<style scoped>
li {
  display: flex;
  margin-bottom: 0.5rem;
  justify-content: space-between;
  padding: 0.3rem;
  padding-left: 0.5rem;
  padding-left: 0.5rem;
  border-radius: 5px;
}
li:hover {
  outline: 1px solid #2d9cdb;
  color: white;
}
.playing {
  background-color: #2d9cdb69;
}
.song {
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.bold {
  font-weight: bold;
}
#spacer {
  height: 2px;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
}
.card {
  background-color: #2e2e2e;
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
  margin: 0.5rem;
  max-height: 50%;
  width: 20rem;
  overflow: auto;
}
#label {
  text-transform: uppercase;
  font-weight: bold;
}
.close {
  padding-top: 1rem;
  position: sticky;
  top: 0;
  background-color: #252525;
}
#queueIcons {
  float: right;
  justify-self: center;
  gap: 1rem;
}
.add-to-playlist {
  width: 2rem;
  color: #baffae;
}
.add-to-playlist:hover {
  color: white;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  color: #2d9cdb;
}
</style>
