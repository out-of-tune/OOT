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
      <img :src="coverUrl" class="cover" id="image" />
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
              currentSong.artists.map((artist) => artist.id),
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
    <div class="player">
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
        <slider
          :min="start"
          :max="end"
          @change="seekTo"
          :model-value="currentTime"
          @update:model-value="seekTo"
        ></slider>
      </div>
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
      <v-icon>mdi-volume-plus</v-icon>
      <input
        type="number"
        v-model="volumePercent"
        min="0"
        max="100"
        @change="setVolume"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import logo from "@/assets/logo.png";
import { searchGraph } from "@/assets/js/graphHelper.js";
import Slider from "./Slider.vue";

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
  components: {
    Slider,
  },
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
    seekTo: function (v) {
      this.currentTime = v;
      this.$refs.player.currentTime = v;
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
          rootState,
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
          this.$refs.currentSongName,
        );
        this.overflows.currentArtistName = this.checkOverflow(
          this.$refs.currentArtistName,
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

  margin-left: 25%;
  margin-bottom: 2%;
  width: 50%;

  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}
.cover {
  height: 3rem;
  width: 3rem;
  object-fit: contain;
}
.currentSongInfo {
  display: flex;
  cursor: pointer;
  gap: 0.5rem;
  align-items: center;
}

.currentSongInfo .songInfoText {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

#queueButton {
  background-color: #da6a1dff;
}
#queueButton:hover {
  background-color: #1dcdda66;
}
#infoButton {
  background-color: #da6a1dff;
}
#infoButton:hover {
  background-color: #1dcdda66;
}
#infoButton .activated {
  background-color: #1dcddaff;
}
#queueButton .activated {
  background-color: #1dcddaff;
}
.currentSongName {
  overflow: hidden;
}
.currentArtistName {
  overflow: hidden;
}
.currentSongName:hover .innerText {
  animation: marquee 12s linear infinite;
}
.currentArtistName:hover .innerText {
  animation: marquee 12s linear infinite;
}
input {
  color: white;
}

.player {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sliderBox {
  width: 100%;
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
