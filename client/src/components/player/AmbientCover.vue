<script setup lang="ts">
import { computed } from "vue";
import type { SpotifyImage } from "@/types/spotify";

/**
 * The cover of the song that plays, blurred into the background of the player, as music
 * apps light their player with the art. It uses the smallest image: a blur needs no
 * detail. The blur is painted once per cover, nothing moves.
 */
const props = defineProps<{ images?: SpotifyImage[] }>();

const url = computed(() => {
  const images = props.images ?? [];
  return images.length > 0 ? images[images.length - 1].url : undefined;
});
</script>

<template>
  <div
    v-if="url"
    class="ambient-cover"
    aria-hidden="true"
    :style="{ '--cover': `url(&quot;${url}&quot;)` }"
  />
</template>

<style scoped>
.ambient-cover {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.ambient-cover::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: var(--cover) center / cover;
  filter: blur(32px) saturate(1.5);
  opacity: 0.32;
}
</style>
