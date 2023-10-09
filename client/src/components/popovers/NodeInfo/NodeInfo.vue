<template>
  <div class="card">
    <div class="close">
      <v-icon
        id="close-icon"
        @click="closeWindow"
        size="1.5rem"
        name="md-close"
      />
    </div>
    <span id="nodeLabel" v-if="node">{{ node.data.label }}</span>
    <div class="content">
      <div v-if="!node.data.label">
        <img :src="logo" aspect-ratio="1" class="image" />
      </div>
      <div v-if="node.data.label === 'artist'">
        <img
          :src="node.data.images ? node.data.images[0] : logo"
          class="image"
        />
        <h2 class="nodeName">
          <a
            class="innerText"
            @click="fitGraphToNodes([node])"
            target="_blank"
            >{{ node.data.name }}</a
          >
        </h2>
        <a
          class="spotifyUrl"
          :href="artistUrl"
          target="_blank"
          @click="trackSpotifyVisit"
          >Visit on Spotify</a
        >
        <h3>Top songs</h3>
        <ul>
          <li
            v-for="track in node.data.tracks"
            v-bind:key="track.id"
            :class="{ noPreview: !track.preview_url }"
          >
            <v-icon
              id="playArrow"
              @click="setSong(track, track.album.images)"
              color="white"
              name="md-playarrow"
            />
            <div id="songName" @click="setSong(track, track.album.images)">
              <span class="innerText" v-if="track.name.length > 25">
                {{ track.name }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                  track.name
                }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span class="innerTextShort" v-else>
                {{ track.name }}
              </span>
            </div>
            <button
              id="addToQueueButton"
              @click="addSongToQueue({ ...track, images: node.data.images })"
              title="add song to queue"
            >
              <v-icon name="md-add" />
            </button>
          </li>
        </ul>
      </div>
      <div v-if="node.data.label === 'genre'">
        <img :src="logo" class="image" />
        <h2 id="genreName">
          <a @click="fitGraphToNodes([node])" class="innerText">{{
            node.data.name
          }}</a>
        </h2>
      </div>
      <div v-if="node.data.label === 'album'">
        <img
          :src="node.data.images ? node.data.images[0].url : logo"
          class="image"
        />
        <h2 class="nodeName">
          <a class="innerText" @click="fitGraphToNodes([node])">{{
            node.data.name
          }}</a>
        </h2>
        <a
          class="spotifyUrl"
          :href="node.data.external_urls.spotify"
          target="_blank"
          >Visit on Spotify</a
        >
        <h3>release date</h3>
        <div>{{ node.data.release_date }}</div>
        <h3>total tracks</h3>
        <div>{{ node.data.total_tracks }}</div>
        <ul>
          <li
            v-for="track in node.data.tracks"
            v-bind:key="track.id"
            :class="{ noPreview: !track.preview_url }"
          >
            <v-icon
              id="playArrow"
              @click="setSong(track, node.data.images)"
              name="md-playarrow"
            />
            <div id="songName" @click="setSong(track, node.data.images)">
              <span class="innerText" v-if="track.name.length > 25">
                {{ track.name }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                  track.name
                }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span class="innerTextShort" v-else>
                {{ track.name }}
              </span>
            </div>
            <button
              id="addToQueueButton"
              @click="addSongToQueue({ ...track, images: node.data.images })"
            >
              <v-icon name="md-add" />
            </button>
          </li>
        </ul>
      </div>
      <div v-if="node.data.label === 'song'">
        <img
          v-if="node.data.album && node.data.album.images"
          :src="node.data.album.images[0].url"
          class="image"
        />
        <h2 class="nodeName">
          <a @click="fitGraphToNodes([node])" class="innerText">{{
            node.data.name
          }}</a>
        </h2>
        <a
          class="spotifyUrl"
          :href="node.data.external_urls.spotify"
          target="_blank"
          >Visit on Spotify</a
        >
        <h3>Duration:</h3>
        {{ new Date(node.data.duration_ms).toISOString().slice(11, -5) }}
        <div v-if="node.data.album">
          <h3>Released:</h3>
          {{ node.data.album.release_date }}
        </div>
        <div v-if="node.data.album">
          <h3>Album:</h3>
          {{ node.data.album.name }} <br />Track {{ node.data.track_number }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import logo from "@/assets/logo.png";
import _ from "lodash";

export default {
  data: () => ({
    logo: logo,
  }),
  computed: {
    node() {
      let node = _.cloneDeep(this.$store.state.mainGraph.currentNode);
      return node;
    },
    artistUrl() {
      return this.node.data.label === "artist"
        ? "https://open.spotify.com/artist/" + this.node.data.sid
        : "";
    },
  },
  methods: {
    ...mapActions([
      "setCurrentSong",
      "playSong",
      "addToQueue",
      "setNodeInfoVisibility",
      "fitGraphToNodes",
      "setSuccess",
    ]),
    setSong: function (track, images) {
      this.playSong({ ...track, images });
    },
    checkOverflow: function (reference) {
      return (
        (reference ? reference.scrollWidth : null) >
        (reference ? reference.offsetWidth : null)
      );
    },
    closeWindow: function () {
      this.setNodeInfoVisibility(false);
    },
    trackSpotifyVisit() {},
    addSongToQueue(song) {
      this.addToQueue(song);
      dispatch("setSuccess", "Added song to queue.");
    },
  },
};
</script>
<style scoped>
.card {
  color: white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding: 1rem;

  margin: 0.5rem;
  width: 20rem;
  overflow-y: auto;
  height: 25rem;
  display: flex;
  flex-direction: column;
}
.close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
#close-icon {
  cursor: pointer;
}
#nodeLabel {
  text-transform: uppercase;
  font-weight: bold;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  grid-template-areas: "play songInfo addToQueue";
  margin-bottom: 0.5rem;
}

.nodeName {
  overflow: hidden;
  white-space: nowrap;
  width: 16rem;
  text-overflow: ellipsis;
}
.nodeName a {
  text-decoration: none;
}
.nodeName:hover {
  overflow: visible;
  white-space: normal;
}
.nodeName .innerText {
  transition: 0.5s;
  display: inline-block;
}
.nodeName:hover .innerText {
  color: #da6a1d;
}

#songName .innerText {
  transition: 0.5s;
  display: inline-block;
}
#songName:hover .innerText {
  color: #1dcddaff;
  animation: marquee 8s linear infinite;
}
#songName .innerTextShort {
  transition: 0.5s;
  display: inline-block;
}
#songName:hover .innerTextShort {
  color: #1dcddaff;
}
a {
  color: white;
}
#playArrow {
  grid-area: play;
  color: white;
}
#addToQueueButton {
  grid-area: addToQueue;
}
#songName {
  grid-area: songInfo;
  width: 12rem;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}
.noPreview {
  color: grey;
}
.spotifyUrl:hover {
  color: #1db954;
}
#genreName {
  text-align: center;
  align-self: center;
  transition: 0.5s;
}
#genreName:hover .innerText {
  color: #da6a1d;
}
@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, 0);
  }
}

.image {
  object-fit: cover;
  width: 100%;
}
</style>
