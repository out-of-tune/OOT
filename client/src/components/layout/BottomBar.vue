<script setup lang="ts">
import { Info, ListMusic } from "@lucide/vue";
import { computed } from "vue";
import MusicPlayer from "@/components/player/MusicPlayer.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { useStore } from "@/store";

const store = useStore();
const nodeInfo = computed(() => store.state.visibleItems.nodeInfo);
const queue = computed(() => store.state.visibleItems.queueDisplay);
const queued = computed(() => store.state.visibleItems.addToQueueNotification);
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex items-end justify-center gap-3 px-3"
  >
    <div class="panel pointer-events-auto flex gap-1 p-1">
      <IconButton
        label="Node info"
        tooltip="top"
        :active="nodeInfo"
        @click="store.dispatch('setNodeInfoVisibility', !nodeInfo)"
      >
        <Info />
      </IconButton>
      <IconButton
        label="Queue"
        tooltip="top"
        :active="queue"
        @click="store.dispatch('setQueueVisibility', !queue)"
      >
        <ListMusic />
        <span
          class="absolute -top-2 -right-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white transition-opacity"
          :class="queued ? 'opacity-100' : 'opacity-0'"
          aria-hidden="true"
        >
          +1
        </span>
      </IconButton>
    </div>
    <div class="pointer-events-auto w-full max-w-3xl">
      <MusicPlayer />
    </div>
  </div>
</template>
