<script setup lang="ts">
import { Search } from "@lucide/vue";
import { computed, ref } from "vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import { useStore } from "@/store";
import type { SearchObject } from "@/types/search";
import SearchQueryInput from "./SearchQueryInput.vue";

type Mode = "spotify" | "graph";

const store = useStore();
const mode = ref<Mode>("spotify");
const simpleText = ref("");
const nodeType = ref("any");
const advancedText = ref("");

const nodeTypeOptions = computed(() => [
  "any",
  ...(store.getters.getNodeLabelNames as string[]),
]);

const modes: { value: Mode; label: string }[] = [
  { value: "spotify", label: "Spotify" },
  { value: "graph", label: "Graph" },
];

function searchSpotify() {
  store.dispatch("startSimpleGraphSearch", {
    nodeType: nodeType.value,
    searchString: simpleText.value.trim(),
  });
}

function updateAdvanced(searchObject: SearchObject) {
  store.dispatch("setSearchObject", searchObject);
  store.dispatch("setSearchString", advancedText.value);
}

function searchGraph() {
  store.dispatch("startAdvancedGraphSearch", { addToSelection: false });
}

const submit = () =>
  mode.value === "spotify" ? searchSpotify() : searchGraph();
</script>

<template>
  <form
    class="search flex min-w-0 items-center gap-2"
    role="search"
    @submit.prevent="submit"
  >
    <UiSegmented v-model="mode" :options="modes" label="Search in" />
    <template v-if="mode === 'spotify'">
      <label class="sr-only" for="search-node-type">Node type</label>
      <select
        id="search-node-type"
        v-model="nodeType"
        class="field w-auto pr-8 capitalize"
      >
        <option v-for="option in nodeTypeOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <input
        v-model="simpleText"
        type="search"
        aria-label="Search artists, albums, songs and genres"
        placeholder="Search artists, albums, songs…"
        class="field w-40 min-w-0 flex-1 lg:w-64"
      />
    </template>
    <div v-else class="w-48 min-w-0 flex-1 lg:w-80">
      <SearchQueryInput
        v-model="advancedText"
        label="Search the graph"
        placeholder='artist: name="Bob Marley"'
        @update:search-object="updateAdvanced"
        @submit="searchGraph"
      />
    </div>
    <button
      type="submit"
      aria-label="Search"
      class="inline-flex size-9 items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent-strong"
    >
      <Search class="size-4" />
    </button>
  </form>
</template>
