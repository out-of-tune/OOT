<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    type?: "button" | "submit";
    disabled?: boolean;
  }>(),
  { variant: "secondary", size: "md", type: "button", disabled: false },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
      {
        'bg-accent text-white hover:bg-accent-strong': variant === 'primary',
        'border border-line bg-surface-raised text-fg hover:border-line-strong hover:bg-surface-hover':
          variant === 'secondary',
        'text-fg-muted hover:bg-surface-hover hover:text-fg':
          variant === 'ghost',
        'border border-danger/40 text-danger hover:bg-danger/10':
          variant === 'danger',
      },
    ]"
  >
    <slot />
  </button>
</template>
