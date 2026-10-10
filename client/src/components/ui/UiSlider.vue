<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ label: string; min?: number; max?: number; step?: number }>(),
  { min: 0, max: 100, step: 1 },
);
const value = defineModel<number>({ required: true });

/** Fill of the track in percent. */
const fill = computed(() => {
  const range = props.max - props.min;
  if (range <= 0) return 0;
  return Math.min(Math.max(((value.value - props.min) / range) * 100, 0), 100);
});
</script>

<template>
  <input
    v-model.number="value"
    type="range"
    :aria-label="label"
    :min="min"
    :max="max"
    :step="step"
    class="slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent"
    :style="{ '--fill': `${fill}%` }"
  />
</template>

<style scoped>
.slider {
  background: linear-gradient(
    to right,
    var(--color-brand-soft) var(--fill),
    var(--color-surface-hover) var(--fill)
  );
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-fg);
  opacity: 0;
  transition: opacity 0.15s;
}

.slider:hover::-webkit-slider-thumb,
.slider:focus-visible::-webkit-slider-thumb {
  opacity: 1;
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 9999px;
  background: var(--color-fg);
}
</style>
