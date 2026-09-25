<script setup lang="ts">
import {
  Heart,
  Laptop,
  MonitorSpeaker,
  Network,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  Speaker,
  Tv,
  Volume1,
  Volume2,
  VolumeX,
} from "@lucide/vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import IconButton from "@/components/ui/IconButton.vue";
import UiPopover from "@/components/ui/UiPopover.vue";
import UiSlider from "@/components/ui/UiSlider.vue";
import { formatDuration } from "@/lib/formatDuration";
import { useStore } from "@/store";
import CurrentSongInfo from "./CurrentSongInfo.vue";

/** How long a slider must rest before its value goes to Spotify, in milliseconds. */
const SLIDER_DELAY = 250;

const store = useStore();
const player = computed(() => store.state.spotify_player);
const track = computed(() => player.value.track);
const durationMs = computed(() => track.value?.durationMs ?? 0);

// The position moves on locally between the state events of Spotify.
const now = ref(Date.now());
let clock: ReturnType<typeof setInterval> | undefined;
watch(
  () => player.value.paused,
  (paused) => {
    if (clock !== undefined) clearInterval(clock);
    clock = paused
      ? undefined
      : setInterval(() => (now.value = Date.now()), 250);
    now.value = Date.now();
  },
  { immediate: true },
);
onBeforeUnmount(() => clearInterval(clock));

/** Slider value while the user drags it. */
const seeking = ref<number | null>(null);
const positionMs = computed(() => {
  if (seeking.value !== null) return seeking.value;
  const { positionMs: position, positionAt, paused } = player.value;
  const elapsed = paused ? 0 : Math.max(now.value - positionAt, 0);
  return Math.min(position + elapsed, durationMs.value || Infinity);
});

let seekTimer: ReturnType<typeof setTimeout> | undefined;
function seek(value: number) {
  seeking.value = value;
  clearTimeout(seekTimer);
  seekTimer = setTimeout(async () => {
    await store.dispatch("spotifySeek", value);
    seeking.value = null;
  }, SLIDER_DELAY);
}

const volume = ref(player.value.volume);
watch(
  () => player.value.volume,
  (value) => (volume.value = value),
);
let volumeTimer: ReturnType<typeof setTimeout> | undefined;
function setVolume(value: number) {
  volume.value = value;
  clearTimeout(volumeTimer);
  volumeTimer = setTimeout(
    () => store.dispatch("spotifySetVolume", value),
    SLIDER_DELAY,
  );
}
let volumeBeforeMute = 50;
function toggleMute() {
  if (volume.value > 0) {
    volumeBeforeMute = volume.value;
    setVolume(0);
  } else setVolume(volumeBeforeMute || 50);
}

const repeatLabel = computed(
  () =>
    ({
      off: "Repeat",
      context: "Repeat one",
      track: "Repeat off",
    })[player.value.repeat],
);

const devicesOpen = ref(false);
watch(devicesOpen, (open) => {
  if (open) store.dispatch("loadSpotifyDevices");
});
const deviceIcon = (type: string) =>
  ({ smartphone: Smartphone, speaker: Speaker, tv: Tv, computer: Laptop })[
    type.toLowerCase()
  ] ?? MonitorSpeaker;
function transfer(deviceId: string | null) {
  if (deviceId) store.dispatch("transferSpotifyPlayback", deviceId);
  devicesOpen.value = false;
}
</script>

<template>
  <div
    class="panel flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-5"
  >
    <div class="flex min-w-0 items-center gap-1 sm:w-64">
      <div class="min-w-0 flex-1">
        <CurrentSongInfo
          :song="track ?? { name: '' }"
          placeholder="Click a song node to play it on Spotify"
        />
      </div>
      <template v-if="track">
        <IconButton
          id="likeButton"
          :label="
            player.liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'
          "
          tooltip="top"
          size="sm"
          @click="store.dispatch('toggleSpotifyLiked')"
        >
          <Heart :class="player.liked ? 'fill-[#1db954] text-[#1db954]' : ''" />
        </IconButton>
        <IconButton
          label="Add to the graph"
          tooltip="top"
          size="sm"
          @click="store.dispatch('addNowPlayingToGraph')"
        >
          <Network />
        </IconButton>
      </template>
    </div>

    <div class="flex min-w-0 flex-1 flex-col items-center gap-1">
      <div class="flex items-center gap-1">
        <IconButton
          label="Shuffle"
          tooltip="top"
          size="sm"
          :active="player.shuffle"
          @click="store.dispatch('spotifyToggleShuffle')"
        >
          <Shuffle />
        </IconButton>
        <IconButton
          id="rewindButton"
          label="Previous"
          tooltip="top"
          size="sm"
          @click="store.dispatch('spotifyPrevious')"
        >
          <SkipBack />
        </IconButton>
        <button
          id="playButton"
          type="button"
          :aria-label="player.paused ? 'Play' : 'Pause'"
          :disabled="!track"
          class="inline-flex size-9 items-center justify-center rounded-full bg-fg text-canvas transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          @click="store.dispatch('spotifyTogglePlay')"
        >
          <Play v-if="player.paused" class="ml-0.5 size-4" />
          <Pause v-else class="size-4" />
        </button>
        <IconButton
          id="forwardButton"
          label="Next"
          tooltip="top"
          size="sm"
          @click="store.dispatch('spotifyNext')"
        >
          <SkipForward />
        </IconButton>
        <IconButton
          :label="repeatLabel"
          tooltip="top"
          size="sm"
          :active="player.repeat !== 'off'"
          @click="store.dispatch('spotifyCycleRepeat')"
        >
          <Repeat1 v-if="player.repeat === 'track'" />
          <Repeat v-else />
        </IconButton>
      </div>
      <div
        class="flex w-full items-center gap-2 text-[11px] text-fg-subtle tabular-nums"
      >
        <span class="w-8 text-right">{{
          formatDuration(Math.floor(positionMs / 1000))
        }}</span>
        <UiSlider
          label="Position"
          :model-value="positionMs"
          :min="0"
          :max="durationMs || 1"
          :step="1000"
          @update:model-value="seek"
        />
        <span class="w-8">{{
          formatDuration(Math.floor(durationMs / 1000))
        }}</span>
      </div>
      <p
        v-if="player.remoteDeviceName"
        class="flex items-center gap-1 text-[11px] text-[#1db954]"
      >
        <MonitorSpeaker class="size-3" /> Playing on
        {{ player.remoteDeviceName }}
      </p>
    </div>

    <div class="hidden items-center gap-1 text-fg-muted sm:flex sm:w-44">
      <UiPopover v-model:open="devicesOpen" label="Devices" placement="top">
        <template #trigger="{ toggle }">
          <IconButton
            label="Devices"
            tooltip="top"
            size="sm"
            :active="devicesOpen || Boolean(player.remoteDeviceName)"
            @click="toggle"
          >
            <MonitorSpeaker />
          </IconButton>
        </template>
        <div class="flex w-64 flex-col gap-1 p-2">
          <h2 class="label px-2 py-1">Play on</h2>
          <button
            v-for="device in player.devices"
            :key="device.id ?? device.name"
            type="button"
            :disabled="!device.id || device.is_restricted"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm disabled:opacity-40"
            :class="
              device.is_active
                ? 'text-[#1db954]'
                : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
            "
            @click="transfer(device.id)"
          >
            <component :is="deviceIcon(device.type)" class="size-4 shrink-0" />
            <span class="truncate">{{
              device.id === player.deviceId ? "This browser" : device.name
            }}</span>
          </button>
          <p
            v-if="player.devices.length === 0"
            class="px-2 py-3 text-xs text-fg-subtle"
          >
            Looking for devices…
          </p>
        </div>
      </UiPopover>
      <IconButton
        :label="volume === 0 ? 'Unmute' : 'Mute'"
        tooltip="top"
        size="sm"
        @click="toggleMute"
      >
        <VolumeX v-if="volume === 0" />
        <Volume1 v-else-if="volume < 50" />
        <Volume2 v-else />
      </IconButton>
      <UiSlider
        label="Volume"
        :model-value="volume"
        @update:model-value="setVolume"
      />
    </div>
  </div>
</template>
