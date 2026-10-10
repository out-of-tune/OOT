<script setup lang="ts">
defineProps<{ label: string }>();
const checked = defineModel<boolean>({ required: true });
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :aria-label="label"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors"
    :class="
      checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-hover'
    "
    @click="checked = !checked"
  >
    <span
      class="inline-block size-4 rounded-full bg-white shadow transition-transform"
      :class="checked ? 'translate-x-6' : 'translate-x-1'"
    />
  </button>
</template>
