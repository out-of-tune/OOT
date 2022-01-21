<template>
  <div class="card">
    <div class="close">
      <v-icon class="icon" id="delete-icon" @click="clearQueue" size="1.5rem" color="white">delete</v-icon>
      <span id="label">queue</span>
      <div id="queueIcons">
        <v-icon class="icon" id="play-icon" v-if="loginState" @click="play" size="1.5rem" color="white">playlist_play</v-icon>
        <v-icon class="icon" id="close-icon" @click="closeWindow" size="1.5rem" color="white">close</v-icon>
      </div>
      <div id="spacer"></div>
    </div>

    <draggable 
    :list="queue" 
    @change="onMove"
    v-if="queue.length>0">
        <li class="song" v-for="(track, index) in queue" v-bind:key="track.key" >
          <button @click="removeFromQueue(index)"><v-icon small color="white">remove</v-icon></button>
          <div :class="{bold: index === queueIndex}" @click="playSong(index)">{{track.name}}</div>
          <button title="add to playlist" v-if="loginState" @click="addSongToCurrentPlaylist(track.uri)">
            <v-icon color="white">playlist_add</v-icon>
          </button>
          <button title="add to Spotify queue" v-if="loginState" @click="addSongToSpotifyQueue(track.uri)">
            <v-icon class="green">add</v-icon>
          </button>
        </li>
    </draggable>
    <h2 v-else>Nothing in queue!</h2>
  </div>
</template>
<script>
import draggable from "vuedraggable"
import { mapActions, mapState } from 'vuex'
import { event } from 'vue-analytics'

export default {
  components: {
    draggable
  },
  methods: {
      ...mapActions([
          'playAtIndexInQueue',
          'addSongToPlaylist',
          'addSongToSpotifyQueue',
          'removeFromQueue',
          'setQueueVisibility',
          'setQueue',
          'playOnSpotify'
      ]),
      closeWindow: function(){
          this.setQueueVisibility(false)
      },
      onMove: function({moved}){
        if(moved.oldIndex==this.queueIndex){
          
          this.setQueue({queue: this.queue, queueIndex: moved.newIndex})
        }
      },
      clearQueue: function(){
        this.setQueue({queue: [], queueIndex: 0})
        event({
          eventCategory: 'musicplayer',
          eventAction: 'clearQueue'
        })
      },
      play: function(){
        const uris = this.queue.map(track=>track.uri)
        this.playOnSpotify(uris)
        event({
          eventCategory: 'musicplayer',
          eventAction: 'playQueueOnSpotify'
        })
      },
      playSong(index){
        this.playAtIndexInQueue(index)
        event({
          eventCategory: 'musicplayer',
          eventAction: 'playSongFromQueue'
        })
      },
      addSongToCurrentPlaylist(uri){
        this.addSongToPlaylist(uri)
        event({
          eventCategory: 'playlistInteraction',
          eventAction: 'addSongToPlaylist'
        })
      },
      addSongToSpotifyQueue(uri){
        this.addSongToQueue(uri)
      }
  },
  computed: {
    ...mapState({
        queueIndex: state => state.music_player.queueIndex,
        loginState: state => state.authentication.loginState
    }),
    queue: {
        get() {
            return this.$store.state.music_player.queue
        },
        set(value) {
          this.setQueue({queue: this.queue, queueIndex: this.queueIndex})
        }
    }
  },
}
</script>

<style scoped>
li {
  display: grid;
  grid-template-columns: 30px 1fr 30px 30px;
  margin-bottom: 0.5rem;
}
.song {
  cursor: pointer;
}
.bold{
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
  text-align: center; 
}
.close {
  padding-top: 1rem;
  position: sticky;
  top:0;
  background-color: #252525;
  text-align: center;
}
#queueIcons {
  float:right;
  justify-self: center;
}
#delete-icon {
  float: left;
}
</style>

