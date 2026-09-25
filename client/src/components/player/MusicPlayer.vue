<script setup lang="ts">
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "@lucide/vue";
import { computed, ref, watch } from "vue";
import IconButton from "@/components/ui/IconButton.vue";
import UiSlider from "@/components/ui/UiSlider.vue";
import { formatDuration } from "@/lib/formatDuration";
import { useStore } from "@/store";
import CurrentSongInfo from "./CurrentSongInfo.vue";

const store = useStore();
const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const volume = ref(50);
const currentTime = ref(0);
const duration = ref(0);

const songUrl = computed(
  () => store.state.music_player.currentSong.preview_url ?? "",
);
const hasSong = computed(() => songUrl.value !== "");

watch(volume, (value) => {
  if (audio.value) audio.value.volume = value / 100;
});

function toggle() {
  if (!audio.value || !hasSong.value) return;
  if (isPlaying.value) audio.value.pause();
  else
    audio.value
      .play()
      .catch(() => store.dispatch("setInfo", "The browser blocked playback"));
}

function onDurationChange() {
  const media = audio.value;
  if (!media) return;
  duration.value = Number.isFinite(media.duration) ? media.duration : 0;
}

function seek(value: number) {
  currentTime.value = value;
  if (audio.value) audio.value.currentTime = value;
}
</script>

<template>
  <div
    class="panel flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-5"
  >
    <audio
      ref="audio"
      :src="songUrl || undefined"
      autoplay
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @timeupdate="currentTime = audio?.currentTime ?? 0"
      @durationchange="onDurationChange"
      @ended="store.dispatch('playNextInQueue')"
      @volumechange="volume = Math.round((audio?.volume ?? 0.5) * 100)"
    />
    <div class="min-w-0 sm:w-56">
      <CurrentSongInfo />
    </div>

    <div class="flex min-w-0 flex-1 flex-col items-center gap-1">
      <div class="flex items-center gap-1">
        <IconButton
          id="rewindButton"
          label="Previous"
          tooltip="top"
          size="sm"
          @click="store.dispatch('playPreviousInQueue')"
        >
          <SkipBack />
        </IconButton>
        <button
          id="playButton"
          type="button"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          :disabled="!hasSong"
          class="inline-flex size-9 items-center justify-center rounded-full bg-fg text-canvas transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          @click="toggle"
        >
          <Pause v-if="isPlaying" class="size-4" />
          <Play v-else class="ml-0.5 size-4" />
        </button>
        <IconButton
          id="forwardButton"
          label="Next"
          tooltip="top"
          size="sm"
          @click="store.dispatch('playNextInQueue')"
        >
          <SkipForward />
        </IconButton>
      </div>
      <div
        class="flex w-full items-center gap-2 text-[11px] text-fg-subtle tabular-nums"
      >
        <span class="w-8 text-right">{{ formatDuration(currentTime) }}</span>
        <UiSlider
          label="Position"
          :model-value="currentTime"
          :min="0"
          :max="duration || 1"
          :step="0.1"
          @update:model-value="seek"
        />
        <span class="w-8">{{ formatDuration(duration) }}</span>
      </div>
    </div>

    <div class="hidden items-center gap-2 text-fg-muted sm:flex sm:w-36">
      <VolumeX v-if="volume === 0" class="size-4 shrink-0" />
      <Volume1 v-else-if="volume < 50" class="size-4 shrink-0" />
      <Volume2 v-else class="size-4 shrink-0" />
      <UiSlider v-model="volume" label="Volume" />
    </div>
  </div>
</template>
