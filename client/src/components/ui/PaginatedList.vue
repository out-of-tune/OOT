<script setup lang="ts" generic="T">
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    items: T[];
    itemKey: (item: T, index: number) => string | number;
    pageSize?: number;
    emptyText?: string;
  }>(),
  { pageSize: 10, emptyText: "Nothing here yet." },
);

defineSlots<{ default(props: { item: T; index: number }): unknown }>();

const page = ref(1);
const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.items.length / props.pageSize)),
);
const pageItems = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return props.items.slice(start, start + props.pageSize);
});

// Stay on a page that exists when the list gets shorter.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count;
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <p
      v-if="items.length === 0"
      class="py-6 text-center text-sm text-fg-subtle"
    >
      {{ emptyText }}
    </p>
    <ul v-else class="flex flex-col gap-1">
      <li
        v-for="(item, index) in pageItems"
        :key="itemKey(item, (page - 1) * pageSize + index)"
      >
        <slot :item="item" :index="(page - 1) * pageSize + index" />
      </li>
    </ul>
    <nav
      v-if="pageCount > 1"
      aria-label="Pages"
      class="flex items-center justify-end gap-2 pt-1 text-xs text-fg-muted"
    >
      <button
        type="button"
        aria-label="Previous page"
        class="rounded p-1 hover:bg-surface-hover disabled:opacity-40"
        :disabled="page === 1"
        @click="page -= 1"
      >
        <ChevronLeft class="size-4" />
      </button>
      <span>{{ page }} / {{ pageCount }}</span>
      <button
        type="button"
        aria-label="Next page"
        class="rounded p-1 hover:bg-surface-hover disabled:opacity-40"
        :disabled="page === pageCount"
        @click="page += 1"
      >
        <ChevronRight class="size-4" />
      </button>
    </nav>
  </div>
</template>
