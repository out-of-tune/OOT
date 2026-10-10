<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Accessible name. It also shows as a tooltip. */
    label: string;
    active?: boolean;
    tooltip?: "left" | "right" | "top" | "bottom" | "none";
    size?: "sm" | "md";
    disabled?: boolean;
  }>(),
  { active: false, tooltip: "left", size: "md", disabled: false },
);
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :aria-pressed="active || undefined"
    :disabled="disabled"
    class="group relative inline-flex shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      size === 'sm' ? 'size-7 [&_svg]:size-4' : 'size-9 [&_svg]:size-[18px]',
      active
        ? 'bg-accent/20 text-accent-strong ring-1 ring-accent/50'
        : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
    ]"
  >
    <slot />
    <span
      v-if="tooltip !== 'none'"
      role="tooltip"
      class="pointer-events-none absolute z-50 rounded-md border border-line bg-surface-raised px-2 py-1 text-xs font-medium whitespace-nowrap text-fg opacity-0 shadow-lg transition-opacity delay-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      :class="{
        'right-full mr-2': tooltip === 'left',
        'left-full ml-2': tooltip === 'right',
        'bottom-full mb-2': tooltip === 'top',
        'top-full mt-2': tooltip === 'bottom',
      }"
    >
      {{ label }}
    </span>
  </button>
</template>
