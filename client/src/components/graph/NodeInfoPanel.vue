<script setup lang="ts">
import {
  Disc3,
  ExternalLink,
  Music,
  Network,
  Play,
  Plus,
  UserCheck,
  UserPlus,
  X,
} from "@lucide/vue";
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { sortBy, uniqBy } from "lodash-es";
import UiButton from "@/components/ui/UiButton.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { formatDuration } from "@/lib/formatDuration";
import { getConnectedNodesAndLinks } from "@/lib/graph";
import { songFromTrack, spotifyImages } from "@/lib/spotifyNode";
import { useStore } from "@/store";
import type { GraphNode } from "@/types/graph";
import type { SpotifyTrack } from "@/types/spotify";

const store = useStore();
const node = computed(() => store.state.mainGraph.currentNode);
const data = computed(() => node.value.data as Record<string, unknown>);
const label = computed(
  () => (node.value.data.label as string | undefined) ?? "",
);

const imageUrl = (images: unknown) => spotifyImages(images)[0]?.url;

const cover = computed(() => {
  if (label.value === "song")
    return imageUrl(
      (data.value.album as { images?: unknown } | undefined)?.images,
    );
  return imageUrl(data.value.images);
});

const spotifyUrl = computed(() => {
  const external = (
    data.value.external_urls as { spotify?: string } | undefined
  )?.spotify;
  if (external) return external;
  const sid = data.value.sid as string | undefined;
  if (!sid || !["artist", "album", "song"].includes(label.value))
    return undefined;
  return `https://open.spotify.com/${label.value === "song" ? "track" : label.value}/${sid}`;
});

const tracks = computed(
  () => (data.value.tracks as SpotifyTrack[] | undefined) ?? [],
);
/** A song of the list, with the cover of the node when the track has no album. */
const songOf = (track: SpotifyTrack) =>
  songFromTrack(track, spotifyImages(data.value.images));

const duration = computed(() => {
  const ms = data.value.duration_ms as number | undefined;
  return ms ? formatDuration(Math.round(ms / 1000)) : undefined;
});

const album = computed(
  () =>
    data.value.album as { name?: string; release_date?: string } | undefined,
);

const loggedIn = computed(() => store.state.authentication.loginState);
const spotifyReady = computed(
  () => store.state.spotify_player.status === "ready",
);
const sid = computed(() => data.value.sid as string | undefined);

/** Spotify URI of the node. An artist or album plays as a context, a song as a track. */
const nodeUri = computed(() => {
  if (!sid.value) return undefined;
  if (label.value === "song") return `spotify:track:${sid.value}`;
  if (label.value === "artist" || label.value === "album")
    return `spotify:${label.value}:${sid.value}`;
  return undefined;
});

function playNode() {
  if (!nodeUri.value) return;
  store.dispatch(
    "spotifyPlay",
    label.value === "song"
      ? { uris: [nodeUri.value] }
      : { contextUri: nodeUri.value },
  );
}

const following = ref(false);
watch(
  [sid, label, loggedIn],
  async ([id, nodeLabel, isLoggedIn]) => {
    following.value = false;
    if (!id || nodeLabel !== "artist" || !isLoggedIn) return;
    const result = await store.dispatch("isFollowingSpotifyArtist", id);
    if (sid.value === id) following.value = result;
  },
  { immediate: true },
);
async function toggleFollow() {
  if (!sid.value) return;
  const follow = !following.value;
  following.value = follow;
  const done = await store.dispatch("followSpotifyArtist", {
    sid: sid.value,
    follow,
  });
  if (!done) following.value = !follow;
}

/** An album track plays in the album, so Spotify goes on with the next track. */
function play(track: SpotifyTrack) {
  if (spotifyReady.value && label.value === "album" && nodeUri.value) {
    store.dispatch("spotifyPlay", {
      contextUri: nodeUri.value,
      offset: { uri: track.uri },
    });
    return;
  }
  store.dispatch("playSong", songOf(track));
}
const queue = (track: SpotifyTrack) =>
  store.dispatch("addToQueue", songOf(track));
/** Neighbors shown per type before "Show all". */
const RELATIONS_SHOWN = 6;

// The graph engine is not reactive, so its change events tell when the neighbors change.
const graphVersion = ref(0);
const onGraphChanged = () => graphVersion.value++;
watch(
  () => store.state.mainGraph.Graph,
  (graph, previous) => {
    previous?.off("changed", onGraphChanged);
    graph.on("changed", onGraphChanged);
    onGraphChanged();
  },
  { immediate: true },
);
onBeforeUnmount(() =>
  store.state.mainGraph.Graph.off("changed", onGraphChanged),
);

/** The node of the panel as it is in the graph, or undefined when it is not in the graph. */
const graphNode = computed(() => {
  void graphVersion.value;
  const id = node.value.id;
  return id === 0 ? undefined : store.state.mainGraph.Graph.getNode(id);
});

/** The neighbors of the node in the graph, by type, in the order of the schema. */
const relations = computed(() => {
  // Links change without a change of the node, so this reads the version too.
  void graphVersion.value;
  const graph = store.state.mainGraph.Graph;
  const id = graphNode.value?.id;
  if (id === undefined) return [];
  const neighbors = uniqBy(
    getConnectedNodesAndLinks({ graph, node: { id } }).map(
      (entry) => entry.node,
    ),
    "id",
  );
  return store.state.schema.nodeTypes
    .map((type) => ({
      label: type.label,
      nodes: sortBy(
        neighbors.filter((neighbor) => neighbor.data.label === type.label),
        (neighbor) => String(neighbor.data.name ?? neighbor.id).toLowerCase(),
      ),
    }))
    .filter((group) => group.nodes.length > 0);
});
/** Types whose neighbors all show. */
const expandedRelations = reactive(new Set<string>());
watch(
  () => node.value.id,
  () => expandedRelations.clear(),
);
const plural = (type: string) =>
  `${type.charAt(0).toUpperCase()}${type.slice(1)}s`;

const focusNode = () => {
  if (node.value.id !== 0)
    store.dispatch("fitGraphToNodes", [node.value as GraphNode]);
};
</script>

<template>
  <section
    aria-label="Node info"
    class="nodeInfo panel flex max-h-[calc(100vh-11rem)] w-80 flex-col overflow-hidden"
  >
    <header
      class="flex items-center justify-between border-b border-line py-2 pr-2 pl-4"
    >
      <span class="label">{{ label || "Node info" }}</span>
      <IconButton
        label="Close node info"
        tooltip="none"
        size="sm"
        @click="store.dispatch('setNodeInfoVisibility', false)"
      >
        <X />
      </IconButton>
    </header>

    <div
      v-if="!label"
      class="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-fg-subtle"
    >
      <img src="@/assets/logo.png" alt="" class="size-14 opacity-80" />
      Click a node to see its details here.
    </div>

    <div v-else class="scrollbar-thin flex flex-col gap-4 overflow-y-auto p-4">
      <div class="flex gap-3">
        <div
          class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-hover"
        >
          <img
            v-if="cover"
            :src="cover"
            alt=""
            class="size-full object-cover"
          />
          <Disc3 v-else class="size-8 text-fg-subtle" />
        </div>
        <div class="flex min-w-0 flex-col justify-center gap-1">
          <button
            type="button"
            class="line-clamp-2 text-left text-base leading-snug font-semibold text-fg hover:text-brand-soft"
            title="Show in the graph"
            @click="focusNode"
          >
            {{ data.name ?? node.id }}
          </button>
          <a
            v-if="spotifyUrl"
            :href="spotifyUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-[#1db954]"
          >
            Open in Spotify <ExternalLink class="size-3" />
          </a>
        </div>
      </div>

      <div
        v-if="(spotifyReady && nodeUri) || (loggedIn && label === 'artist')"
        class="flex gap-2"
      >
        <UiButton
          v-if="spotifyReady && nodeUri"
          variant="primary"
          size="sm"
          @click="playNode"
        >
          <Play class="size-3.5" /> Play
        </UiButton>
        <UiButton
          v-if="loggedIn && label === 'artist'"
          size="sm"
          :aria-pressed="following"
          @click="toggleFollow"
        >
          <UserCheck v-if="following" class="size-3.5" />
          <UserPlus v-else class="size-3.5" />
          {{ following ? "Following" : "Follow" }}
        </UiButton>
      </div>

      <dl
        v-if="label === 'album' || label === 'song'"
        class="grid grid-cols-2 gap-x-3 gap-y-2 text-sm"
      >
        <template v-if="label === 'album'">
          <div v-if="data.release_date">
            <dt class="text-xs text-fg-subtle">Released</dt>
            <dd>{{ data.release_date }}</dd>
          </div>
          <div v-if="data.total_tracks">
            <dt class="text-xs text-fg-subtle">Tracks</dt>
            <dd>{{ data.total_tracks }}</dd>
          </div>
        </template>
        <template v-else>
          <div v-if="duration">
            <dt class="text-xs text-fg-subtle">Duration</dt>
            <dd class="tabular-nums">{{ duration }}</dd>
          </div>
          <div v-if="album?.release_date">
            <dt class="text-xs text-fg-subtle">Released</dt>
            <dd>{{ album.release_date }}</dd>
          </div>
          <div v-if="album?.name" class="col-span-2">
            <dt class="text-xs text-fg-subtle">Album</dt>
            <dd class="truncate">
              {{ album.name
              }}<span v-if="data.track_number">
                · track {{ data.track_number }}</span
              >
            </dd>
          </div>
        </template>
      </dl>

      <div v-if="tracks.length > 0" class="flex flex-col gap-1">
        <h3 class="label mb-1">Songs</h3>
        <ul class="flex flex-col">
          <li
            v-for="track in tracks"
            :key="track.id"
            class="group flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-surface-hover"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-2 text-left"
              :class="
                spotifyReady || track.preview_url ? 'text-fg' : 'text-fg-subtle'
              "
              :title="
                spotifyReady
                  ? 'Play'
                  : track.preview_url
                    ? 'Play preview'
                    : 'No preview available'
              "
              @click="play(track)"
            >
              <Play
                class="size-3.5 shrink-0 text-fg-subtle group-hover:text-fg"
              />
              <span class="truncate">{{ track.name }}</span>
            </button>
            <IconButton
              label="Add to queue"
              tooltip="none"
              size="sm"
              @click="queue(track)"
            >
              <Plus />
            </IconButton>
          </li>
        </ul>
      </div>
      <p
        v-else-if="label === 'artist' || label === 'album'"
        class="flex items-center gap-2 text-xs text-fg-subtle"
      >
        <Music class="size-3.5" /> No songs loaded
      </p>

      <div class="flex flex-col gap-2">
        <h3 class="label">Relations</h3>
        <div v-for="group in relations" :key="group.label">
          <h4 class="mb-1 text-xs text-fg-subtle">
            {{ plural(group.label) }} ({{ group.nodes.length }})
          </h4>
          <ul class="flex flex-wrap gap-1">
            <li
              v-for="neighbor in expandedRelations.has(group.label)
                ? group.nodes
                : group.nodes.slice(0, RELATIONS_SHOWN)"
              :key="neighbor.id"
              class="max-w-full"
            >
              <button
                type="button"
                class="max-w-full truncate rounded-md border border-line px-2 py-0.5 text-left text-xs text-fg-muted hover:border-line-strong hover:bg-surface-hover hover:text-fg"
                :title="`Expand ${neighbor.data.name ?? neighbor.id} and show it here`"
                @click="store.dispatch('focusAndExpandNode', neighbor)"
              >
                {{ neighbor.data.name ?? neighbor.id }}
              </button>
            </li>
            <li v-if="group.nodes.length > RELATIONS_SHOWN">
              <button
                type="button"
                class="rounded-md px-2 py-0.5 text-xs text-accent-strong hover:underline"
                @click="
                  expandedRelations.has(group.label)
                    ? expandedRelations.delete(group.label)
                    : expandedRelations.add(group.label)
                "
              >
                {{
                  expandedRelations.has(group.label)
                    ? "Show less"
                    : `Show all ${group.nodes.length}`
                }}
              </button>
            </li>
          </ul>
        </div>
        <div
          v-if="relations.length === 0"
          class="flex items-center justify-between gap-2 text-xs text-fg-subtle"
        >
          <span>No relations in the graph yet.</span>
          <UiButton
            v-if="graphNode"
            size="sm"
            @click="store.dispatch('focusAndExpandNode', graphNode)"
          >
            <Network class="size-3.5" /> Load relations
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>
