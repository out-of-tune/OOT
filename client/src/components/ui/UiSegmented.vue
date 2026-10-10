<script setup lang="ts" generic="T extends string">
defineProps<{ options: { value: T; label: string }[]; label: string }>();
const selected = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex rounded-lg border border-line bg-surface-raised p-0.5"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="selected === option.value"
      class="rounded-md px-3 py-1 text-sm font-medium transition-colors"
      :class="
        selected === option.value
          ? 'bg-surface-hover text-fg shadow-sm'
          : 'text-fg-muted hover:text-fg'
      "
      @click="selected = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
