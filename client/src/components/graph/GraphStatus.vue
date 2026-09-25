<script setup lang="ts">
import { Flashlight, LoaderCircle, Move, Pause } from "@lucide/vue";
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const paused = computed(() => !store.state.mainGraph.renderState.isRendered);
const pending = computed(() => store.state.appearance.pendingRequestCount);
const groupMove = computed(() => store.state.events.groupMoveActive);
const highlight = computed(() => store.state.appearance.highlight);
const visible = computed(
  () => paused.value || pending.value > 0 || groupMove.value || highlight.value,
);
</script>

<template>
  <div
    v-if="visible"
    role="status"
    aria-live="polite"
    class="panel flex items-center gap-3 px-3 py-1.5 text-xs text-fg-muted"
  >
    <span
      v-if="pending > 0"
      class="flex items-center gap-1.5"
      :class="{ 'text-danger': pending > 100 }"
    >
      <LoaderCircle class="size-3.5 animate-spin" />
      Loading<span v-if="pending > 1" class="tabular-nums">
        ({{ pending }})</span
      >
    </span>
    <span
      v-if="paused"
      class="flex items-center gap-1.5"
      title="Press Space to resume"
    >
      <Pause class="size-3.5" /> Paused
    </span>
    <span
      v-if="groupMove"
      class="flex items-center gap-1.5"
      title="Press M to leave move mode"
    >
      <Move class="size-3.5" /> Move
    </span>
    <span
      v-if="highlight"
      class="flex items-center gap-1.5"
      title="Press H to leave highlight mode"
    >
      <Flashlight class="size-3.5" /> Highlight
    </span>
  </div>
</template>
