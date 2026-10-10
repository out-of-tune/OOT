<script setup lang="ts">
import { Download, RotateCcw, Trash, Upload } from "@lucide/vue";
import { computed, ref, useId } from "vue";
import IconButton from "@/components/ui/IconButton.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import { useStore } from "@/store";

type Kind = "configuration" | "graph";

const store = useStore();
const kind = ref<Kind>("graph");
const name = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const listId = useId();

const kinds: { value: Kind; label: string }[] = [
  { value: "graph", label: "Graph" },
  { value: "configuration", label: "Configuration" },
];

const storedNames = computed(() =>
  kind.value === "graph"
    ? store.state.graph_io.storedGraphNames
    : store.state.configuration_io.storedConfigurationNames,
);
const trimmedName = computed(() => name.value.trim());
const exists = computed(() => storedNames.value.includes(trimmedName.value));

function save() {
  store.dispatch(
    kind.value === "graph" ? "storeGraph" : "storeConfiguration",
    trimmedName.value,
  );
}

function load(selected = trimmedName.value) {
  store.dispatch(
    kind.value === "graph"
      ? "loadGraphFromIndexedDb"
      : "loadConfigurationFromIndexedDb",
    selected,
  );
}

function remove(selected: string) {
  store.dispatch(
    kind.value === "graph"
      ? "removeGraphFromIndexedDb"
      : "removeConfigurationFromIndexedDb",
    selected,
  );
  if (name.value === selected) name.value = "";
}

/** Downloads the current graph or configuration as a JSON file. */
async function download() {
  await store.dispatch(
    kind.value === "graph" ? "downloadGraph" : "downloadConfiguration",
  );
  const url =
    kind.value === "graph"
      ? store.state.graph_io.url
      : store.state.configuration_io.url;
  if (!url) return;
  const link = document.createElement("a");
  link.href = url;
  link.download = `${trimmedName.value || "out-of-tune"}_${kind.value === "graph" ? "graph" : "config"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const text = await file.text();
  store.dispatch(
    kind.value === "graph" ? "importGraph" : "importConfiguration",
    text,
  );
  input.value = "";
}

function resetConfiguration() {
  store.dispatch("initConfiguration");
  store.dispatch("applyAllConfigurations");
  store.dispatch("setInfo", "Configuration reset");
}
</script>

<template>
  <div class="flex w-80 flex-col gap-3 p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Save / load</h2>
      <UiSegmented v-model="kind" :options="kinds" label="What to save" />
    </div>

    <form class="flex gap-1.5" @submit.prevent="save">
      <label class="sr-only" :for="`${listId}-name`">Name</label>
      <input
        :id="`${listId}-name`"
        v-model="name"
        type="text"
        :list="listId"
        :placeholder="kind === 'graph' ? 'Graph name' : 'Configuration name'"
        class="field"
      />
      <datalist :id="listId">
        <option v-for="stored in storedNames" :key="stored" :value="stored" />
      </datalist>
      <UiButton type="submit" variant="primary" :disabled="!trimmedName">
        {{ exists ? "Overwrite" : "Save" }}
      </UiButton>
    </form>

    <div>
      <h3 class="label mb-1.5">Saved in this browser</h3>
      <p v-if="storedNames.length === 0" class="text-xs text-fg-subtle">
        Nothing saved yet.
      </p>
      <ul v-else class="scrollbar-thin flex max-h-40 flex-col overflow-y-auto">
        <li
          v-for="stored in storedNames"
          :key="stored"
          class="group flex items-center justify-between gap-2 rounded-md py-0.5 pr-0.5 pl-2 text-sm hover:bg-surface-hover"
        >
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left"
            :title="`Load ${stored}`"
            @click="load(stored)"
          >
            {{ stored }}
          </button>
          <IconButton
            :label="`Delete ${stored}`"
            tooltip="none"
            size="sm"
            @click="remove(stored)"
          >
            <Trash />
          </IconButton>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap gap-1.5 border-t border-line pt-3">
      <UiButton size="sm" @click="download"
        ><Download class="size-3.5" /> Download</UiButton
      >
      <UiButton size="sm" @click="fileInput?.click()"
        ><Upload class="size-3.5" /> Load file</UiButton
      >
      <UiButton
        v-if="kind === 'configuration'"
        size="sm"
        variant="ghost"
        @click="resetConfiguration"
      >
        <RotateCcw class="size-3.5" /> Reset
      </UiButton>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="importFile"
      />
    </div>
  </div>
</template>
