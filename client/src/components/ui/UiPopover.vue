<script setup lang="ts">
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from "@floating-ui/vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";

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

const { floatingStyles, placement: finalPlacement } = useFloating(
  reference,
  floating,
  {
    placement: () => props.placement,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  },
);

/** The panel grows out of the side that faces its trigger. */
const origin = computed(
  () =>
    ({ left: "right", right: "left", top: "bottom", bottom: "top" })[
      finalPlacement.value.split("-")[0] as "left" | "right" | "top" | "bottom"
    ],
);

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
    <!-- Only opacity and scale animate. Floating UI places the panel with a transform,
         and a transition of it would fly the panel in from the corner of the page. -->
    <Transition
      enter-active-class="transition-[opacity,scale] duration-100 ease-out"
      enter-from-class="scale-[0.98] opacity-0"
      leave-active-class="transition-[opacity,scale] duration-75 ease-in"
      leave-to-class="scale-[0.98] opacity-0"
    >
      <div
        v-if="open"
        ref="floating"
        role="dialog"
        :aria-label="label"
        class="panel z-[90] bg-surface"
        :style="{ ...floatingStyles, transformOrigin: origin }"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>
