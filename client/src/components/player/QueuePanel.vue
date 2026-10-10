<script setup lang="ts">
import {
  ListMusic,
  ListPlus,
  ListVideo,
  ListX,
  LocateFixed,
  Minus,
  Save,
  X,
} from "@lucide/vue";
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import IconButton from "@/components/ui/IconButton.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiPopover from "@/components/ui/UiPopover.vue";
import { useStore } from "@/store";
import type { Song } from "@/types/spotify";

const store = useStore();
const queueIndex = computed(() => store.state.music_player.queueIndex);
const loggedIn = computed(() => store.state.authentication.loginState);
const spotify = computed(() => store.state.spotify_player);
const spotifyReady = computed(() => spotify.value.status === "ready");
const follow = computed(() => store.state.music_player.followPlayback);

/** A song of either list. Both carry what a row shows. */
type QueueItem = Pick<Song, "name" | "uri" | "images"> & {
  artists?: { name: string }[];
};

/**
 * The songs of the list: the songs up next on Spotify when the Spotify player is connected,
 * else the preview queue. A drag sets the new order.
 */
const items = computed<QueueItem[]>({
  get: () =>
    spotifyReady.value ? spotify.value.queue : store.state.music_player.queue,
  set: (value) => {
    if (spotifyReady.value) {
      store.dispatch("setSpotifyQueue", value);
      return;
    }
    // Keep the playing song selected after a drag.
    const queue = store.state.music_player.queue;
    const index = Math.max(value.indexOf(queue[queueIndex.value]), 0);
    store.dispatch("setQueue", { queue: value, queueIndex: index });
  },
});

/** The songs that the queue buttons act on. Spotify: the song that plays, then the songs up next. */
const songs = computed<QueueItem[]>(() =>
  spotifyReady.value && spotify.value.track
    ? [spotify.value.track, ...items.value]
    : items.value,
);
const uris = computed(() =>
  songs.value
    .map((song) => song.uri)
    .filter((uri): uri is string => Boolean(uri)),
);

/** Plays the song now. On Spotify the songs before it leave the list. */
const play = (index: number) =>
  store.dispatch(
    spotifyReady.value ? "playFromSpotifyQueue" : "playAtIndexInQueue",
    index,
  );
const remove = (index: number) =>
  store.dispatch(
    spotifyReady.value ? "removeFromSpotifyQueue" : "removeFromQueue",
    index,
  );

const close = () => store.dispatch("setQueueVisibility", false);
const clear = () => (items.value = []);
const playOnSpotify = () => store.dispatch("playOnSpotify", uris.value);
const toggleFollow = () => store.dispatch("setFollowPlayback", !follow.value);
const addAllToPlaylist = () =>
  store.dispatch(
    "addSongsToPlaylist",
    songs.value.filter((song) => song.uri),
  );

const saveOpen = ref(false);
const playlistName = ref("");
const saving = ref(false);
watch(saveOpen, (isOpen) => {
  if (isOpen && !playlistName.value)
    playlistName.value = `out-of-tune ${new Date().toLocaleDateString()}`;
});
async function saveAsPlaylist() {
  if (saving.value) return;
  saving.value = true;
  try {
    const playlist = await store.dispatch("createPlaylist", {
      name: playlistName.value,
      uris: uris.value,
    });
    if (playlist) {
      saveOpen.value = false;
      playlistName.value = "";
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section aria-label="Queue" class="panel flex max-h-[50vh] w-80 flex-col">
    <header
      class="flex items-center justify-between gap-2 border-b border-line py-2 pr-2 pl-4"
    >
      <h2 class="label truncate">
        {{ spotifyReady ? "Up next" : "Queue" }}
      </h2>
      <div class="flex items-center">
        <IconButton
          :label="
            follow
              ? 'Stop following the song that plays'
              : 'Follow the song that plays in the graph'
          "
          tooltip="top"
          size="sm"
          :active="follow"
          @click="toggleFollow"
        >
          <LocateFixed />
        </IconButton>
        <IconButton
          v-if="loggedIn && !spotifyReady"
          label="Play queue on Spotify"
          tooltip="top"
          size="sm"
          :disabled="uris.length === 0"
          @click="playOnSpotify"
        >
          <ListVideo />
        </IconButton>
        <template v-if="loggedIn">
          <IconButton
            label="Add all to playlist"
            tooltip="top"
            size="sm"
            :disabled="uris.length === 0"
            @click="addAllToPlaylist"
          >
            <ListPlus />
          </IconButton>
          <UiPopover
            v-model:open="saveOpen"
            label="Save as playlist"
            placement="top"
          >
            <template #trigger="{ toggle }">
              <IconButton
                label="Save as new playlist"
                tooltip="top"
                size="sm"
                :active="saveOpen"
                :disabled="uris.length === 0"
                @click="toggle"
              >
                <Save />
              </IconButton>
            </template>
            <form
              class="flex w-64 flex-col gap-2 p-3"
              @submit.prevent="saveAsPlaylist"
            >
              <label class="label" for="queue-playlist-name"
                >New playlist</label
              >
              <input
                id="queue-playlist-name"
                v-model="playlistName"
                type="text"
                maxlength="100"
                class="field"
                autofocus
              />
              <p class="text-xs text-fg-subtle">
                {{ uris.length }} songs{{
                  spotifyReady
                    ? ": the song that plays and the songs up next"
                    : ""
                }}
              </p>
              <UiButton
                type="submit"
                variant="primary"
                size="sm"
                :disabled="!playlistName.trim() || saving"
              >
                {{ saving ? "Saving…" : "Save" }}
              </UiButton>
            </form>
          </UiPopover>
        </template>
        <IconButton
          label="Clear queue"
          tooltip="top"
          size="sm"
          :disabled="items.length === 0"
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
      v-if="items.length === 0"
      class="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-fg-subtle"
    >
      <ListMusic class="size-6" />
      {{ spotifyReady ? "Nothing up next." : "Nothing in the queue yet." }}
      Add songs from the node info, a selection or the queue click mode.
    </div>

    <VueDraggable
      v-else
      v-model="items"
      tag="ol"
      :animation="150"
      handle=".drag-handle"
      class="scrollbar-thin flex flex-col gap-0.5 overflow-y-auto p-2"
    >
      <li
        v-for="(song, index) in items"
        :key="`${song.uri ?? song.name}-${index}`"
        class="group flex items-center gap-2 rounded-md px-1 py-1 text-sm transition-colors"
        :class="
          !spotifyReady && index === queueIndex
            ? 'bg-accent/15 text-fg'
            : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
        "
      >
        <span
          class="drag-handle w-5 shrink-0 cursor-grab text-right text-xs text-fg-subtle tabular-nums"
          title="Drag to move"
        >
          {{ index + 1 }}
        </span>
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-2 text-left"
          title="Play now"
          @click="play(index)"
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
            <span v-if="song.artists?.length" class="block truncate text-xs">{{
              song.artists.map((artist) => artist.name).join(", ")
            }}</span>
          </span>
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
            @click="remove(index)"
          >
            <Minus />
          </IconButton>
        </div>
      </li>
    </VueDraggable>
  </section>
</template>
