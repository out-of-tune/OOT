<script setup lang="ts">
import { Music } from "@lucide/vue";
import { computed } from "vue";
import { searchGraph } from "@/lib/graph";
import { useStore } from "@/store";
import type { SpotifyImage } from "@/types/spotify";

const props = defineProps<{
  song: {
    id?: string | null;
    name: string;
    images?: SpotifyImage[];
    artists?: { name: string; id?: string }[];
  };
  /** Text shown when no song is set. */
  placeholder: string;
}>();

const store = useStore();
const cover = computed(() => props.song.images?.[0]?.url);
const artists = computed(() =>
  (props.song.artists ?? []).map((artist) => artist.name).join(", "),
);

/** Centers the graph on the nodes of the song or of its artists. */
function showInGraph(type: "song" | "artist", sids: (string | undefined)[]) {
  const nodes = sids
    .filter((sid): sid is string => Boolean(sid))
    .flatMap((sid) =>
      searchGraph(
        {
          nodeType: type,
          valid: true,
          errors: [],
          attributes: [
            { attributeData: sid, attributeSearch: "sid", operator: "=" },
          ],
        },
        store.state,
      ),
    );
  if (nodes.length > 0) store.dispatch("fitGraphToNodes", nodes);
  else store.dispatch("setInfo", `This ${type} is not in the graph`);
}
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <div
      class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-hover"
    >
      <img v-if="cover" :src="cover" alt="" class="size-full object-cover" />
      <Music v-else class="size-5 text-fg-subtle" />
    </div>
    <div class="min-w-0 text-sm">
      <template v-if="song.name">
        <button
          type="button"
          class="block max-w-full truncate font-medium text-fg hover:text-brand-soft"
          title="Show the song in the graph"
          @click="showInGraph('song', [song.id ?? undefined])"
        >
          {{ song.name }}
        </button>
        <button
          type="button"
          class="block max-w-full truncate text-xs text-fg-muted hover:text-brand-soft"
          title="Show the artists in the graph"
          @click="
            showInGraph(
              'artist',
              (song.artists ?? []).map((artist) => artist.id),
            )
          "
        >
          {{ artists }}
        </button>
      </template>
      <p v-else class="text-xs text-fg-subtle">{{ placeholder }}</p>
    </div>
  </div>
</template>
