<script setup lang="ts">
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/vue";
import { onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    placement?: Placement;
    /** Accessible name of the panel. */
    label: string;
  }>(),
  { placement: "left" },
);

const open = defineModel<boolean>("open", { default: false });

const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);

const { floatingStyles } = useFloating(reference, floating, {
  placement: () => props.placement,
  middleware: [offset(10), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (reference.value?.contains(target) || floating.value?.contains(target))
    return;
  open.value = false;
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onDocumentKeydown);
  } else {
    document.removeEventListener("pointerdown", onDocumentPointerDown);
    document.removeEventListener("keydown", onDocumentKeydown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onDocumentKeydown);
});

const toggle = () => (open.value = !open.value);
const close = () => (open.value = false);
</script>

<template>
  <div ref="reference" class="inline-flex">
    <slot name="trigger" :open="open" :toggle="toggle" />
  </div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      leave-active-class="transition duration-75 ease-in"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="open"
        ref="floating"
        role="dialog"
        :aria-label="label"
        class="panel z-[90] bg-surface"
        :style="floatingStyles"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>
