<script setup lang="ts">
import { ListMusic, ListPlus, ListVideo, ListX, Minus, X } from "@lucide/vue";
import { computed } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import IconButton from "@/components/ui/IconButton.vue";
import { useStore } from "@/store";
import type { Song } from "@/types/spotify";

const store = useStore();
const queueIndex = computed(() => store.state.music_player.queueIndex);
const loggedIn = computed(() => store.state.authentication.loginState);

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
      <h2 class="label">Queue</h2>
      <div class="flex items-center">
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

    <div
      v-if="queue.length === 0"
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
