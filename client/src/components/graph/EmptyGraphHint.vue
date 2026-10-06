<script setup lang="ts">
import { Search } from "@lucide/vue";
import { computed } from "vue";
import { activeThemeId, themeById } from "@/lib/themes";
import { useStore } from "@/store";

/** Shown while the graph has no nodes, so a new user knows how to start. */
const store = useStore();

/** The theme names a short headline and the genres to start with. */
const theme = computed(() => themeById(activeThemeId(store.state.appearance)));

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
    <p
      v-if="theme.tagline"
      class="text-[11px] font-semibold tracking-[0.2em] text-brand-soft uppercase"
    >
      {{ theme.name }} · {{ theme.tagline }}
    </p>
    <Search v-else class="size-7 text-fg-subtle" />
    <h2
      id="empty-graph-title"
      class="text-xl font-semibold tracking-tight text-fg"
    >
      Where do you want to start?
    </h2>
    <p class="text-sm text-fg-muted">
      Search for an artist, album, song or genre in the top left, or pick a
      genre:
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="example in theme.suggestions"
        :key="example"
        type="button"
        class="genre-chip rounded-full border border-line bg-surface-raised/80 px-3.5 py-1.5 text-sm text-fg backdrop-blur-md transition-[border-color,color,box-shadow] duration-200 hover:border-accent hover:text-accent-strong"
        @click="searchGenre(example)"
      >
        {{ example }}
      </button>
    </div>
  </section>
</template>

<style scoped>
/* A soft glow in the theme color on hover and focus, painted once by the browser. */
.genre-chip:hover,
.genre-chip:focus-visible {
  box-shadow: 0 0 18px -4px var(--color-accent);
}
</style>
