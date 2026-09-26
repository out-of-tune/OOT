<script setup lang="ts">
import { X } from "@lucide/vue";
import { nextTick, ref, useId, watch } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  { size: "md" },
);
const emit = defineEmits<{ close: [] }>();

const titleId = useId();
const dialog = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      await nextTick();
      const first = dialog.value?.querySelector<HTMLElement>(
        `[autofocus], ${FOCUSABLE}`,
      );
      (first ?? dialog.value)?.focus();
    } else {
      previouslyFocused?.focus?.();
    }
  },
  { immediate: true },
);

/** Keeps the Tab key inside the dialog. */
function trapFocus(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.stopPropagation();
    emit("close");
    return;
  }
  if (event.key !== "Tab" || !dialog.value) return;
  const focusable = [
    ...dialog.value.querySelectorAll<HTMLElement>(FOCUSABLE),
  ].filter((element) => !element.hasAttribute("disabled"));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:pt-[10vh]"
        @mousedown.self="emit('close')"
      >
        <div
          ref="dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="panel flex max-h-[85vh] w-full flex-col bg-surface outline-none"
          :class="{
            'max-w-sm': size === 'sm',
            'max-w-lg': size === 'md',
            'max-w-2xl': size === 'lg',
            'max-w-4xl': size === 'xl',
          }"
          @keydown="trapFocus"
        >
          <header
            class="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5"
          >
            <h2 :id="titleId" class="text-base font-semibold text-fg">
              {{ title }}
            </h2>
            <button
              type="button"
              aria-label="Close"
              class="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
              @click="emit('close')"
            >
              <X class="size-4" />
            </button>
          </header>
          <div class="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <slot />
          </div>
          <footer
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 border-t border-line px-5 py-3"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
