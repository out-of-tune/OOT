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
    <CurrentSongInfo />
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
          :model-value="currentTime"
          @update:model-value="seekTo"
        ></slider>
      </div>
    </div>

    <div class="volume">
      <v-icon>mdi-volume-minus</v-icon>
      <Slider
        class="volumeslider"
        :model-value="volumePercent"
        @update:model-value="setVolume"
        min="0"
        max="100"
      ></Slider>
      <v-icon>mdi-volume-plus</v-icon>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Slider from "./Slider.vue";
import CurrentSongInfo from "./CurrentSongInfo.vue";

export default {
  data: () => ({
    isPlaying: false,
    volumePercent: 50,
    currentTime: 0,
    start: 0,
    end: 2,
    isSeeking: false,
  }),
  components: {
    Slider,
    CurrentSongInfo,
  },
  computed: {
    ...mapState({
      songUrl: (state) => state.music_player.currentSong.preview_url,
    }),
  },
  methods: {
    ...mapActions(["playNextInQueue", "playPreviousInQueue"]),
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
    setVolume: function (v) {
      this.volumePercent = v;
      this.$refs.player.volume = v / 100.0;
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
  },
  mounted: function () {},
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
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 500px) {
  .card {
    flex-direction: column;
    flex-shrink: 2;
  }
  .player {
    width: 100%;
  }
  .currentSongInfo {
    width: 100%;
  }
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  min-width: 75px;
  flex-grow: 1;
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

.volume {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.volumeslider {
  width: 100px;
}
</style>
