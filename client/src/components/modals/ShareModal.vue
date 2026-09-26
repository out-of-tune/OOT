<script setup lang="ts">
import { Check, Copy } from "@lucide/vue";
import { computed, ref } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiModal from "@/components/ui/UiModal.vue";
import { useStore } from "@/store";

const store = useStore();
const open = computed(() => store.state.share.shareModalOpen);
const link = computed(() => store.state.share.shareLink);
const generating = ref(false);
const copied = ref(false);

const close = () => store.dispatch("changeShareModalState", false);

async function generate(type: "graph" | "settings") {
  generating.value = true;
  copied.value = false;
  await store.dispatch("generateShareLink", type);
  generating.value = false;
}

async function copy() {
  try {
    await navigator.clipboard.writeText(link.value);
    copied.value = true;
    store.dispatch("setInfo", "Link copied");
  } catch {
    store.dispatch(
      "setError",
      new Error("Copy failed. Select the link and copy it by hand."),
    );
  }
}
</script>

<template>
  <UiModal :open="open" title="Share" @close="close">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-fg-muted">
        Create a link to the current graph, or to your configuration of colors,
        sizes and rules.
      </p>
      <div class="grid grid-cols-2 gap-2">
        <UiButton :disabled="generating" @click="generate('graph')"
          >Share graph</UiButton
        >
        <UiButton :disabled="generating" @click="generate('settings')"
          >Share configuration</UiButton
        >
      </div>
      <div v-if="link" class="flex gap-2">
        <input
          :value="link"
          readonly
          aria-label="Share link"
          class="field font-mono text-xs"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <UiButton variant="primary" @click="copy">
          <Check v-if="copied" class="size-4" />
          <Copy v-else class="size-4" />
          {{ copied ? "Copied" : "Copy" }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>
