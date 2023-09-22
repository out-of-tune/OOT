<template>
  <div class="card" id="player">
    <audio
      ref="player"
      :src="songUrl"
      v-on:pause="isPlaying = false"
      v-on:play="isPlaying = true"
      autoplay
      @timeupdate="setTime"
      @durationchange="setStartEnd"
      @ended="NextSong"
    >
      Your browser does not support the audio element.
    </audio>
    <div class="currentSongInfo">
      <v-img :src="coverUrl" aspect-ratio="1" class="cover" id="image"> </v-img>
      <div class="songInfoText">
        <h3
          ref="currentSongName"
          class="currentSongName"
          @click="findNodesInGraph('song', [currentSong.id])"
        >
          <div
            :class="{
              innerText: overflows.currentSongName,
              innerTextShort: !overflows.currentSongName,
            }"
          >
            {{ currentSong.name
            }}<span id="textExtension" v-if="overflows.currentSongName">{{
              currentSong.name
            }}</span>
          </div>
        </h3>
        <div
          class="currentArtistName"
          ref="currentArtistName"
          @click="
            findNodesInGraph(
              'artist',
              currentSong.artists.map((artist) => artist.id)
            )
          "
        >
          <div
            :class="{
              innerText: overflows.currentArtistName,
              innerTextShort: !overflows.currentArtistName,
            }"
          >
            {{ getArtists()
            }}<span id="textExtension" v-if="overflows.currentArtistName">{{
              getArtists()
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="controls">
      <button
        id="rewindButton"
        small
        min-width="1px"
        color="#f14e14"
        v-on:click="PrevSong"
      >
        <v-icon icon="mdi-skip-previous" />
      </button>

      <button id="playButton" color="#da6a1d" v-on:click="StartStop">
        <v-icon v-if="!isPlaying" icon="mdi-play" />
        <v-icon v-if="isPlaying" icon="mdi-pause" />
      </button>

      <button id="forwardButton" color="#f14e14" v-on:click="NextSong">
        <v-icon icon="mdi-skip-next" />
      </button>
    </div>
    <div id="timeSlider" class="sliderBox">
      <v-slider
        v-model="currentTime"
        color="white"
        :min="start"
        :max="end"
        :hide-details="true"
        dark
        @change="seekTo"
        @start="isSeeking = true"
        @end="isSeeking = false"
      ></v-slider>
    </div>
    <div id="queue">
      <div id="buttons">
        <button
          id="queueButton"
          small
          :class="{ activated: queueDisplay }"
          @click="setQueueVisibility(!queueDisplay)"
        >
          <v-icon icon="mdi-playlist-music" />
        </button>
        <button
          id="infoButton"
          small
          :class="{ activated: nodeInfoDisplay }"
          @click="setNodeInfoVisibility(!nodeInfoDisplay)"
        >
          <v-icon icon="mdi-information" />
        </button>
      </div>
    </div>

    <div class="volume">
      <div class="sliderBox">
        <v-slider
          v-model="volumePercent"
          append-icon="mdi-volume-plus"
          prepend-icon="mdi-volume-minus"
          min="0"
          max="100"
          @change="setVolume"
        ></v-slider>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import logo from "@/assets/logo.png";
import { searchGraph } from "@/assets/js/graphHelper.js";

export default {
  data: () => ({
    isPlaying: false,
    volumePercent: 50,
    currentTime: 0,
    start: 0,
    end: 2,
    isSeeking: false,
    overflows: {
      currentSongName: false,
      currentArtistName: false,
    },
  }),
  computed: {
    ...mapState({
      songUrl: (state) => state.music_player.currentSong.preview_url,
      queueDisplay: (state) => state.visibleItems.queueDisplay,
      nodeInfoDisplay: (state) => state.visibleItems.nodeInfo,
    }),
    currentSong: {
      get() {
        return this.$store.state.music_player.currentSong;
      },
      set(value) {},
    },
    coverUrl() {
      if (this.currentSong.images.length > 0)
        return this.currentSong.images[0].url;
      else return logo;
    },
  },
  methods: {
    ...mapActions([
      "playNextInQueue",
      "playPreviousInQueue",
      "setQueueVisibility",
      "setNodeInfoVisibility",
      "fitGraphToNodes",
    ]),
    StartStop: function () {
      if (this.isPlaying) {
        this.$refs.player.pause();
      } else {
        this.$refs.player.play();
      }
    },
    setStartEnd: function () {
      this.start = this.$refs.player.seekable.start(0);
      this.end = this.$refs.player.seekable.end(0);
    },
    setVolume: function () {
      this.$refs.player.volume = this.volumePercent / 100.0;
    },
    setTime: function () {
      if (!this.isSeeking) {
        this.currentTime = this.$refs.player.currentTime;
      }
    },
    seekTo: function () {
      this.$refs.player.currentTime = this.currentTime;
    },
    NextSong: function () {
      this.playNextInQueue();
    },
    PrevSong: function () {
      this.playPreviousInQueue();
    },
    getArtists: function () {
      return this.currentSong.artists
        ? this.currentSong.artists.map((artist) => artist.name).join(", ")
        : "";
    },
    checkOverflow: function (reference) {
      return (
        (reference ? reference.scrollWidth : null) >
        (reference ? reference.offsetWidth : null)
      );
    },
    findNodesInGraph: function (type, sids) {
      const rootState = this.$store.state;
      const result = sids.flatMap((sid) => {
        return searchGraph(
          {
            nodeType: type,
            valid: true,
            errors: [],
            attributes: [
              { attributeData: sid, attributeSearch: "sid", operator: "=" },
            ],
          },
          rootState
        );
      });
      this.fitGraphToNodes(result);
    },
  },
  mounted: function () {},
  watch: {
    currentSong: function () {
      this.overflows.currentSongName = false;
      this.overflows.currentArtistName = false;

      this.$nextTick(function () {
        this.overflows.currentSongName = this.checkOverflow(
          this.$refs.currentSongName
        );
        this.overflows.currentArtistName = this.checkOverflow(
          this.$refs.currentArtistName
        );
      });
    },
  },
};
</script>

<style scoped>
.card {
  color: white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  min-height: 5rem;
  width: 100%;
  display: grid;
  grid-template:
    "songInfo controls queue volume" 1fr
    "songInfo timeSlider queue volume"/ 2fr 4fr 1fr 1fr;
}
.v-input__icon {
  color: white !important;
}
.cover {
  height: 4rem;
  width: 4rem;
  object-fit: contain;
  border: 3px solid #da6a1d;
  grid-area: cover;
  align-self: center;
  display: grid;
  grid-area: cover;
}
.currentSongInfo {
  grid-area: songInfo;
  align-self: center;
  align-content: center;
  margin-right: 2rem;
  display: grid;
  grid-template: "cover info" 5rem/4rem 1fr;
}
.currentSongInfo {
  cursor: pointer;
}
.currentSongInfo p {
  margin: 0;
}
.currentSongInfo .songInfoText {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 1rem;
  grid-area: info;
  align-self: center;
}
.controls {
  grid-area: controls;
  margin-bottom: -1.5rem;
  text-align: center;
}
.volume {
  grid-area: volume;
  align-self: center;
}
#forwardButton {
  min-height: 1rem;
  grid-area: forwardButton;
}
#playButton {
  min-height: 1rem;
  grid-area: playButton;
}
#rewindButton {
  min-height: 1rem;
  grid-area: rewindButton;
}
#timeSlider {
  grid-area: timeSlider;
}
#timeSlider .v-input--slider {
  margin: 0;
}
#queue {
  grid-area: queue;
  display: grid;
}
#controls .button {
  margin: 0;
}
#queueButton {
  float: right;
  min-width: 25%;
  background-color: #da6a1dff;
}
#queueButton:hover {
  background-color: #1dcdda66;
}
#infoButton {
  min-width: 25%;
  float: right;
  background-color: rgb(241, 78, 20);
}
#infoButton:hover {
  background-color: #1dcdda66;
}
.activated {
  background-color: #1dcddaff !important;
}
.currentSongName {
  overflow: hidden;
}
.currentArtistName {
  overflow: hidden;
}
.innerText {
  display: inline-block;
}
.currentSongName:hover .innerText {
  animation: marquee 12s linear infinite;
}
.currentArtistName:hover .innerText {
  animation: marquee 12s linear infinite;
}
#textExtension {
  display: inline-block;
  padding-left: 2rem;
  padding-right: 2rem;
}
#buttons {
  justify-self: center;
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, 0);
  }
}
</style>
