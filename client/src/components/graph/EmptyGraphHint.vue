<script setup lang="ts">
import { Search } from "@lucide/vue";
import { useStore } from "@/store";

/** Shown while the graph has no nodes, so a new user knows how to start. */
const store = useStore();

const examples = ["rock", "jazz", "hip hop", "electronic"];

function searchGenre(name: string) {
  store.dispatch("startSimpleGraphSearch", {
    nodeType: "genre",
    searchString: name,
  });
}
</script>

<template>
  <section
    aria-labelledby="empty-graph-title"
    class="pointer-events-auto flex max-w-sm flex-col items-center gap-3 px-6 text-center"
  >
    <Search class="size-7 text-fg-subtle" />
    <h2 id="empty-graph-title" class="text-base font-semibold text-fg">
      The graph is empty
    </h2>
    <p class="text-sm text-fg-muted">
      Search for an artist, album, song or genre in the top left. Or start with
      a genre:
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="example in examples"
        :key="example"
        type="button"
        class="rounded-full border border-line bg-surface-raised px-3 py-1 text-sm text-fg transition-colors hover:border-accent hover:text-accent-strong"
        @click="searchGenre(example)"
      >
        {{ example }}
      </button>
    </div>
  </section>
</template>
