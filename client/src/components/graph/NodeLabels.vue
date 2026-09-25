<script setup lang="ts">
import type { NodeLabel } from "@/store/modules/graph_camera";

defineProps<{ items: NodeLabel[] }>();
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="item in items"
      :key="item.id"
      class="absolute max-w-28 -translate-x-1/2 translate-y-3 truncate rounded px-1.5 py-0.5 text-[11px] leading-tight font-medium shadow"
      :style="{
        left: `${item.coordinates.x}px`,
        top: `${item.coordinates.y}px`,
        color: item.colors.textColor,
        backgroundColor: item.colors.backgroundColor,
      }"
    >
      {{ item.data[item.dataKey || "name"] }}
    </span>
  </div>
</template>
