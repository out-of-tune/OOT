<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import PreviewPlayer from "./PreviewPlayer.vue";
import SpotifyPlayer from "./SpotifyPlayer.vue";

const store = useStore();
/** The full Spotify player needs a connected Web Playback SDK device in this tab. */
const spotifyReady = computed(
  () => store.state.spotify_player.status === "ready",
);
</script>

<template>
  <SpotifyPlayer v-if="spotifyReady" />
  <PreviewPlayer v-else />
</template>
