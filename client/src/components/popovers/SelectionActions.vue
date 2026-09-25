<script setup lang="ts">
import { computed } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import { getNodePosition } from "@/lib/graph";
import { useStore } from "@/store";

const emit = defineEmits<{ done: [] }>();

const store = useStore();
const selected = computed(() => store.state.selection.selectedNodes);
const songCount = computed(
  () => selected.value.filter((node) => node.data.label === "song").length,
);
const loggedIn = computed(() => store.state.authentication.loginState);

function run(action: string, payload?: unknown) {
  store.dispatch(action, payload);
}

/** Lines the selected nodes up by name, starting at the first selected node. */
function sortNodes() {
  const first = selected.value[0];
  if (!first) return;
  const position = getNodePosition(store.state, first);
  run("applyNodeCoordinateSystemLine", {
    xOffset: position.x,
    yOffset: -position.y,
  });
}

function showItems() {
  run("changeSelectionModalState", true);
  emit("done");
}
</script>

<template>
  <div class="flex w-72 flex-col gap-3 p-3">
    <div class="flex items-baseline justify-between">
      <h2 id="menu-header" class="text-sm font-semibold">Selection</h2>
      <span class="text-xs text-fg-muted tabular-nums"
        >{{ selected.length }} nodes</span
      >
    </div>
    <p
      v-if="selected.length === 0"
      class="text-xs leading-relaxed text-fg-subtle"
    >
      Hold <kbd class="rounded border border-line px-1">Shift</kbd> and drag on
      the graph, or use the search, to select nodes.
    </p>
    <div
      class="grid grid-cols-3 gap-1.5"
      :class="{ 'pointer-events-none opacity-50': selected.length === 0 }"
    >
      <UiButton size="sm" @click="run('expandSelectedNodes')">Expand</UiButton>
      <UiButton size="sm" @click="run('collapseSelectedNodes')"
        >Collapse</UiButton
      >
      <UiButton size="sm" @click="run('removeSelectedNodes')">Remove</UiButton>
      <UiButton size="sm" @click="run('pinNodes', selected)">Pin</UiButton>
      <UiButton size="sm" @click="run('unpinNodes', selected)">Unpin</UiButton>
      <UiButton size="sm" @click="run('invertSelection')">Invert</UiButton>
      <UiButton size="sm" @click="sortNodes">Sort</UiButton>
      <UiButton
        size="sm"
        class="col-span-2"
        :disabled="songCount === 0"
        @click="run('addSelectedSongsToQueue')"
      >
        Add songs to queue
      </UiButton>
    </div>
    <div class="flex gap-1.5">
      <UiButton
        v-if="loggedIn"
        size="sm"
        class="flex-1"
        :disabled="songCount === 0"
        @click="run('addSelectedSongsToPlaylist')"
      >
        Add to playlist
      </UiButton>
      <UiButton
        size="sm"
        variant="primary"
        class="flex-1"
        :disabled="selected.length === 0"
        @click="showItems"
      >
        Show items
      </UiButton>
    </div>
  </div>
</template>
