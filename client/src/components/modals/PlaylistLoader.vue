<script setup lang="ts">
import {
  Heart,
  History,
  ListMusic,
  LogIn,
  Mic2,
  Play,
  Plus,
} from "@lucide/vue";
import { computed, nextTick, ref, watch } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiModal from "@/components/ui/UiModal.vue";
import { useStore } from "@/store";
import type { SpotifyPlaylist } from "@/types/spotify";

const store = useStore();
const open = computed(() => store.state.playlists.playlistLoaderOpen);
const loggedIn = computed(() => store.state.authentication.loginState);
const playlists = computed(() => store.state.playlists.playlists);
const currentPlaylist = computed(() => store.state.playlists.currentPlaylist);
const filter = ref("");
const selected = ref<SpotifyPlaylist | null>(null);
const loading = ref(false);

/** Case-insensitive text filter. The text is not a regular expression. */
const filtered = computed(() => {
  const query = filter.value.trim().toLowerCase();
  return query
    ? playlists.value.filter((playlist) =>
        playlist.name.toLowerCase().includes(query),
      )
    : playlists.value;
});

/** Distance from the end of the list at which the next page loads, in pixels. */
const LOAD_MORE_DISTANCE = 120;

const total = computed(() => store.state.playlists.playlistsTotal);
const allLoaded = computed(
  () => total.value !== null && playlists.value.length >= total.value,
);
const list = ref<HTMLElement | null>(null);

async function fetchPlaylists(more = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    await store.dispatch(
      more ? "loadMoreCurrentUsersPlaylists" : "getCurrentUsersPlaylists",
    );
  } catch {
    store.dispatch("setError", new Error("Your playlists could not be loaded"));
    return;
  } finally {
    loading.value = false;
  }
  await nextTick();
  loadMoreIfNeeded();
}

/** Loads the next page when the list is scrolled near its end, or does not fill its box. */
function loadMoreIfNeeded() {
  const element = list.value;
  if (!element || loading.value || allLoaded.value) return;
  if (
    element.scrollHeight - element.scrollTop - element.clientHeight <
    LOAD_MORE_DISTANCE
  )
    fetchPlaylists(true);
}

// Each open loads the playlists again, so playlists made in other Spotify apps show.
watch(
  [open, loggedIn],
  ([isOpen, isLoggedIn]) => {
    if (isOpen && isLoggedIn) fetchPlaylists();
  },
  { immediate: true },
);
// A filter can leave the list too short to scroll. More pages then load at once.
watch(filter, () => nextTick(loadMoreIfNeeded));

const newName = ref("");
const creating = ref(false);
async function createPlaylist() {
  if (!newName.value.trim() || creating.value) return;
  creating.value = true;
  try {
    const playlist: SpotifyPlaylist | undefined = await store.dispatch(
      "createPlaylist",
      { name: newName.value },
    );
    if (playlist) {
      newName.value = "";
      filter.value = "";
      selected.value = playlist;
      list.value?.scrollTo({ top: 0 });
    }
  } finally {
    creating.value = false;
  }
}

const close = () => store.dispatch("changePlaylistLoaderState", false);
const spotifyReady = computed(
  () => store.state.spotify_player.status === "ready",
);

function playSelected() {
  if (!selected.value) return;
  store.dispatch("spotifyPlay", {
    contextUri: selected.value.uri ?? `spotify:playlist:${selected.value.id}`,
  });
}

/** Builds a graph from the Spotify library of the user. */
function loadLibrary(
  action:
    "loadTopArtistsGraph" | "loadLikedSongsGraph" | "loadRecentlyPlayedGraph",
) {
  store.dispatch(action);
  close();
}

function loadGraph() {
  if (!selected.value) return;
  store.dispatch("loadPlaylist", selected.value);
  close();
}
</script>

<template>
  <UiModal :open="open" title="Playlists" size="lg" @close="close">
    <div
      v-if="!loggedIn"
      class="flex flex-col items-center gap-4 py-8 text-center"
    >
      <ListMusic class="size-8 text-fg-subtle" />
      <p class="max-w-sm text-sm text-fg-muted">
        Log in to Spotify to turn your playlists into graphs and to add songs to
        them.
      </p>
      <UiButton variant="primary" @click="store.dispatch('login')"
        ><LogIn class="size-4" /> Log in with Spotify</UiButton
      >
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-[1fr_14rem]">
      <div class="flex min-w-0 flex-col gap-2">
        <input
          v-model="filter"
          type="search"
          placeholder="Filter playlists"
          aria-label="Filter playlists"
          class="field"
        />
        <ul
          ref="list"
          role="listbox"
          aria-label="Your playlists"
          class="scrollbar-thin flex h-72 flex-col overflow-y-auto rounded-lg border border-line p-1"
          @scroll.passive="loadMoreIfNeeded"
        >
          <li v-for="playlist in filtered" :key="playlist.id">
            <button
              type="button"
              role="option"
              :aria-selected="selected?.id === playlist.id"
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
              :class="
                selected?.id === playlist.id
                  ? 'bg-accent/20 text-fg'
                  : 'text-fg-muted hover:bg-surface-hover hover:text-fg'
              "
              @click="selected = playlist"
              @dblclick="loadGraph"
            >
              <img
                v-if="playlist.images?.[0]"
                :src="playlist.images[0].url"
                alt=""
                class="size-7 rounded object-cover"
              />
              <span v-else class="size-7 rounded bg-surface-hover" />
              <span class="truncate">{{ playlist.name }}</span>
            </button>
          </li>
          <li
            v-if="!loading && filtered.length === 0"
            class="p-4 text-center text-xs text-fg-subtle"
          >
            No playlists found.
          </li>
        </ul>
        <p class="text-xs text-fg-subtle" aria-live="polite">
          {{
            loading
              ? "Loading…"
              : total === null
                ? `${playlists.length} playlists`
                : `${playlists.length} of ${total} playlists`
          }}
        </p>
        <form class="flex gap-2" @submit.prevent="createPlaylist">
          <input
            v-model="newName"
            type="text"
            maxlength="100"
            placeholder="New playlist name"
            aria-label="New playlist name"
            class="field"
          />
          <UiButton
            type="submit"
            :disabled="!newName.trim() || creating"
            class="shrink-0"
            ><Plus class="size-4" /> Create</UiButton
          >
        </form>
      </div>

      <aside class="flex flex-col gap-4 text-sm">
        <div>
          <h3 class="label mb-1">Selected</h3>
          <p class="truncate">{{ selected?.name ?? "No playlist selected" }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <UiButton variant="primary" :disabled="!selected" @click="loadGraph"
            >Load as graph</UiButton
          >
          <UiButton
            :disabled="!selected"
            @click="selected && store.dispatch('setCurrentPlaylist', selected)"
          >
            Add songs to this playlist
          </UiButton>
          <UiButton
            v-if="spotifyReady"
            :disabled="!selected"
            @click="playSelected"
            ><Play class="size-4" /> Play</UiButton
          >
        </div>
        <div class="flex flex-col gap-1 border-t border-line pt-3">
          <h3 class="label mb-1">Graph from your library</h3>
          <UiButton variant="ghost" @click="loadLibrary('loadTopArtistsGraph')"
            ><Mic2 class="size-4" /> Top artists</UiButton
          >
          <UiButton variant="ghost" @click="loadLibrary('loadLikedSongsGraph')"
            ><Heart class="size-4" /> Liked songs</UiButton
          >
          <UiButton
            variant="ghost"
            @click="loadLibrary('loadRecentlyPlayedGraph')"
            ><History class="size-4" /> Recently played</UiButton
          >
        </div>
        <div class="border-t border-line pt-3">
          <h3 class="label mb-1">Songs are added to</h3>
          <p class="truncate text-fg-muted">
            {{ currentPlaylist.name ?? "No playlist chosen" }}
          </p>
        </div>
      </aside>
    </div>
  </UiModal>
</template>
