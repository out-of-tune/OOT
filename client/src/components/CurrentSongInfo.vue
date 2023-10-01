<template>
    <div class="currentSongInfo">
      <img :src="coverUrl" class="cover" id="image" />
      <div class="songInfoText">
        <p
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
        </p>
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
</template>

<script>
import logo from "@/assets/logo.png";
import { searchGraph } from "@/assets/js/graphHelper.js";
import { mapActions } from "vuex";

export default {
  data: ()=> ({
    overflows: {
      currentSongName: false,
      currentArtistName: false,
    },
  }),
  computed: {
    currentSong: {
      get() {
        return this.$store.state.music_player.currentSong;
      }
    },
    coverUrl() {
      if (this.currentSong.images.length > 0)
        return this.currentSong.images[0].url;
      else return logo;
    },
  },
  methods: {
    ...mapActions([
      "fitGraphToNodes",
    ]),
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
}
</script>
<style scoped>

@media screen and (min-width: 600px) {
  .currentSongInfo {
    width: 200px;
  }
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
  width: 100%;
}

.currentSongName {
  font-weight: bold;
  overflow: hidden;
}
.currentArtistName {
  font-style: italic;
  overflow: hidden;
}
.currentSongName:hover {
  color: #da6a1d;
}
.currentSongName:hover .innerText {
  animation: marquee 6s linear infinite;
}
.currentArtistName:hover .innerText {
  animation: marquee 6s linear infinite;
}


.cover {
  height: 3rem;
  width: 3rem;
  object-fit: contain;
}
</style>
