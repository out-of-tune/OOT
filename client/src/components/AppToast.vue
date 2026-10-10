<script setup lang="ts">
import { CircleCheck, CircleX, Info, X } from "@lucide/vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useStore } from "@/store";

/** How long a message stays, in milliseconds. */
const DURATION = 5000;

const store = useStore();
const visible = ref(false);
const message = ref("");
const color = ref(store.state.snackbar.color);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => store.state.snackbar.messageId,
  () => {
    const text = store.state.snackbar.message;
    if (!text) return;
    message.value = text;
    color.value = store.state.snackbar.color;
    visible.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (visible.value = false), DURATION);
  },
);

onBeforeUnmount(() => clearTimeout(timer));

const icon = computed(
  () => ({ error: CircleX, success: CircleCheck, info: Info })[color.value],
);
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-20 z-[200] flex justify-center px-3"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="visible"
        :key="store.state.snackbar.messageId"
        :role="color === 'error' ? 'alert' : 'status'"
        class="panel pointer-events-auto relative flex max-w-lg items-start gap-3 overflow-hidden bg-surface-raised py-3 pr-2 pl-3.5 text-sm"
      >
        <component
          :is="icon"
          class="mt-0.5 size-4 shrink-0"
          :class="{
            'text-danger': color === 'error',
            'text-success': color === 'success',
            'text-info': color === 'info',
          }"
        />
        <p class="min-w-0 flex-1 break-words whitespace-pre-line">
          {{ message }}
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          class="rounded p-0.5 text-fg-subtle hover:bg-surface-hover hover:text-fg"
          @click="visible = false"
        >
          <X class="size-4" />
        </button>
        <span
          class="toast-timer absolute bottom-0 left-0 h-0.5"
          :class="{
            'bg-danger': color === 'error',
            'bg-success': color === 'success',
            'bg-info': color === 'info',
          }"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-timer {
  animation: shrink 5s linear forwards;
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}
</style>
