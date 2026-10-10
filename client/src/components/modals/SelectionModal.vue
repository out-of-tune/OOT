<script setup lang="ts">
import { computed } from "vue";
import PaginatedList from "@/components/ui/PaginatedList.vue";
import UiModal from "@/components/ui/UiModal.vue";
import { toHexColor } from "@/lib/color";
import { getNodeColor } from "@/lib/graph";
import { useStore } from "@/store";
import type { GraphNode } from "@/types/graph";

const store = useStore();
const open = computed(() => store.state.selection.modalOpen);
const selected = computed(() => store.state.selection.selectedNodes);

const counts = computed(() =>
  store.state.schema.nodeTypes
    .map((type) => ({
      label: type.label,
      count: selected.value.filter((node) => node.data.label === type.label)
        .length,
    }))
    .filter((entry) => entry.count > 0),
);

/** CSS color of a node, as the graph shows it. */
function colorOf(node: GraphNode) {
  try {
    return `#${toHexColor(getNodeColor(store.state, node)).substring(0, 6)}`;
  } catch {
    return "transparent";
  }
}

const close = () => store.dispatch("changeSelectionModalState", false);
</script>

<template>
  <UiModal :open="open" title="Selected nodes" size="lg" @close="close">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2">
        <span
          class="rounded-full bg-surface-hover px-2.5 py-1 text-xs font-medium"
        >
          {{ selected.length }} selected
        </span>
        <span
          v-for="entry in counts"
          :key="entry.label"
          class="rounded-full border border-line px-2.5 py-1 text-xs text-fg-muted"
        >
          {{ entry.count }} {{ entry.label }}
        </span>
      </div>
      <PaginatedList
        :items="selected"
        :item-key="(node) => node.id"
        :page-size="12"
        empty-text="No nodes selected."
      >
        <template #default="{ item }">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-hover"
            title="Move the camera to this node"
            @click="store.dispatch('moveToNode', item)"
          >
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: colorOf(item) }"
            />
            <span class="min-w-0 flex-1 truncate">{{
              item.data.name ?? item.id
            }}</span>
            <span class="text-xs text-fg-subtle italic">{{
              item.data.label
            }}</span>
          </button>
        </template>
      </PaginatedList>
    </div>
  </UiModal>
</template>
