<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SearchQueryInput from "@/components/search/SearchQueryInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import {
  searchObjectForAttribute,
  searchObjectForType,
} from "@/lib/search/searchObject";
import { useStore } from "@/store";
import RuleList from "./RuleList.vue";

const props = defineProps<{ nodeLabel: string }>();
const store = useStore();
const query = ref("");
const sizeType = ref<"compare" | "map">("compare");
const size = ref(20);
const min = ref(5);
const max = ref(40);

const attributes = computed(
  () =>
    store.state.schema.nodeTypes.find(
      (nodeType) => nodeType.label === props.nodeLabel,
    )?.attributes ?? [],
);
const mapAttribute = ref("");
// The schema can load after this component.
watch(
  attributes,
  (options) => {
    if (options.includes(mapAttribute.value)) return;
    mapAttribute.value = options.includes("popularity")
      ? "popularity"
      : (options[0] ?? "");
  },
  { immediate: true },
);

const sizeTypes = [
  { value: "compare" as const, label: "Fixed" },
  { value: "map" as const, label: "Map attribute" },
];

function addRule() {
  const values =
    sizeType.value === "compare" ? [size.value] : [min.value, max.value];
  if (!values.every((value) => Number.isFinite(value))) {
    store.dispatch(
      "setError",
      new Error("The rule could not be added: enter whole numbers"),
    );
    return;
  }
  const isMap = sizeType.value === "map";
  store.dispatch("addRule", {
    type: "size",
    searchObject: isMap
      ? searchObjectForAttribute(props.nodeLabel, mapAttribute.value)
      : searchObjectForType(props.nodeLabel, query.value),
    searchString: isMap ? mapAttribute.value : query.value,
    sizeType: sizeType.value,
    ...(sizeType.value === "compare"
      ? { size: size.value }
      : { min: min.value, max: max.value }),
  });
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <UiSegmented
      v-model="sizeType"
      :options="sizeTypes"
      :label="`Size rule type for ${nodeLabel}`"
      class="self-start"
    />
    <form class="flex flex-col gap-1.5" @submit.prevent="addRule">
      <select
        v-if="sizeType === 'map'"
        v-model="mapAttribute"
        :aria-label="`Attribute that sets the size of ${nodeLabel}`"
        class="field"
      >
        <option v-for="option in attributes" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <SearchQueryInput
        v-else
        v-model="query"
        :fixed-node-type="nodeLabel"
        :label="`Size rule condition for ${nodeLabel}`"
        placeholder="popularity>50"
        @submit="addRule"
      />
      <div class="flex items-center gap-1.5">
        <template v-if="sizeType === 'compare'">
          <label class="flex flex-1 items-center gap-2 text-xs text-fg-muted">
            Size
            <input v-model.number="size" type="number" min="1" class="field" />
          </label>
        </template>
        <template v-else>
          <label class="flex flex-1 items-center gap-2 text-xs text-fg-muted">
            Min
            <input v-model.number="min" type="number" min="1" class="field" />
          </label>
          <label class="flex flex-1 items-center gap-2 text-xs text-fg-muted">
            Max
            <input v-model.number="max" type="number" min="1" class="field" />
          </label>
        </template>
        <UiButton type="submit">Add</UiButton>
      </div>
    </form>
    <RuleList :node-label="nodeLabel" type="size" />
  </div>
</template>
