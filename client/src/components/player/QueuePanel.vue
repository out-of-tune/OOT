<script setup lang="ts">
import {
  ListMusic,
  ListPlus,
  ListVideo,
  ListX,
  Minus,
  RefreshCw,
  X,
} from "@lucide/vue";
import { computed, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import IconButton from "@/components/ui/IconButton.vue";
import { useStore } from "@/store";
import type { Song } from "@/types/spotify";

const store = useStore();
const queueIndex = computed(() => store.state.music_player.queueIndex);
const loggedIn = computed(() => store.state.authentication.loginState);
const spotify = computed(() => store.state.spotify_player);
const spotifyReady = computed(() => spotify.value.status === "ready");

// The Spotify queue changes on every new song, so it reloads with the track.
watch(
  [spotifyReady, () => spotify.value.track?.id],
  ([ready]) => {
    if (ready) store.dispatch("loadSpotifyQueue");
  },
  { immediate: true },
);

const queue = computed<Song[]>({
  get: () => store.state.music_player.queue,
  set: (value) => {
    // Keep the playing song selected after a drag.
    const playing = store.state.music_player.queue[queueIndex.value];
    const index = Math.max(value.indexOf(playing), 0);
    store.dispatch("setQueue", { queue: value, queueIndex: index });
  },
});

const close = () => store.dispatch("setQueueVisibility", false);
const clear = () => store.dispatch("setQueue", { queue: [], queueIndex: 0 });
const playOnSpotify = () =>
  store.dispatch(
    "playOnSpotify",
    queue.value
      .map((song) => song.uri)
      .filter((uri): uri is string => Boolean(uri)),
  );
</script>

<template>
  <section aria-label="Queue" class="panel flex max-h-[50vh] w-80 flex-col">
    <header
      class="flex items-center justify-between border-b border-line py-2 pr-2 pl-4"
    >
      <h2 class="label">
        {{ spotifyReady ? "Up next on Spotify" : "Queue" }}
      </h2>
      <div v-if="spotifyReady" class="flex items-center">
        <IconButton
          label="Reload"
          tooltip="top"
          size="sm"
          @click="store.dispatch('loadSpotifyQueue')"
        >
          <RefreshCw />
        </IconButton>
        <IconButton label="Close" tooltip="top" size="sm" @click="close">
          <X />
        </IconButton>
      </div>
      <div v-else class="flex items-center">
        <IconButton
          v-if="loggedIn"
          label="Play queue on Spotify"
          tooltip="top"
          size="sm"
          @click="playOnSpotify"
        >
          <ListVideo />
        </IconButton>
        <IconButton
          label="Clear queue"
          tooltip="top"
          size="sm"
          :disabled="queue.length === 0"
          @click="clear"
        >
          <ListX />
        </IconButton>
        <IconButton label="Close" tooltip="top" size="sm" @click="close">
          <X />
        </IconButton>
      </div>
    </header>

    <template v-if="spotifyReady">
      <div
        v-if="spotify.queue.length === 0"
        class="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-fg-subtle"
      >
        <ListMusic class="size-6" />
        Nothing up next. Add songs from the node info or a selection.
      </div>
      <ol
        v-else
        class="scrollbar-thin flex flex-col gap-0.5 overflow-y-auto p-2"
      >
        <li
          v-for="(song, index) in spotify.queue"
          :key="`${song.uri}-${index}`"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
            title="Play now"
            @click="store.dispatch('spotifyPlay', { uris: [song.uri] })"
          >
            <img
              v-if="song.images[0]"
              :src="song.images[song.images.length - 1].url"
              alt=""
              class="size-7 shrink-0 rounded object-cover"
            />
            <span v-else class="size-7 shrink-0 rounded bg-surface-hover" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-fg">{{ song.name }}</span>
              <span class="block truncate text-xs">{{
                song.artists.map((artist) => artist.name).join(", ")
              }}</span>
            </span>
          </button>
        </li>
      </ol>
    </template>

    <div
      v-else-if="queue.length === 0"
      class="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-fg-subtle"
    >
      <ListMusic class="size-6" />
      Nothing in the queue yet. Add songs from the node info or a selection.
    </div>

    <VueDraggable
      v-else
      v-model="queue"
      tag="ol"
      :animation="150"
      handle=".drag-handle"
      class="scrollbar-thin flex flex-col gap-0.5 overflow-y-auto p-2"
    >
      <li
        v-for="(song, index) in queue"
        :key="`${song.uri ?? song.name}-${index}`"
        class="group flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors"
        :class="
          index === queueIndex
            ? 'bg-accent/15 text-fg'
            : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
        "
      >
        <span
          class="drag-handle w-5 shrink-0 cursor-grab text-right text-xs text-fg-subtle tabular-nums"
        >
          {{ index + 1 }}
        </span>
        <button
          type="button"
          class="min-w-0 flex-1 truncate text-left"
          @click="store.dispatch('playAtIndexInQueue', index)"
        >
          {{ song.name }}
        </button>
        <div
          class="flex opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        >
          <IconButton
            v-if="loggedIn"
            label="Add to playlist"
            tooltip="none"
            size="sm"
            @click="store.dispatch('addSongToPlaylist', song)"
          >
            <ListPlus />
          </IconButton>
          <IconButton
            label="Remove"
            tooltip="none"
            size="sm"
            @click="store.dispatch('removeFromQueue', index)"
          >
            <Minus />
          </IconButton>
        </div>
      </li>
    </VueDraggable>
  </section>
</template>
