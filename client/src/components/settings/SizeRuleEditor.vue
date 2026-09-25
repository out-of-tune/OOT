<script setup lang="ts">
import { ref } from "vue";
import SearchQueryInput from "@/components/search/SearchQueryInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import { generateSearchObject } from "@/lib/search/searchObject";
import { useStore } from "@/store";
import RuleList from "./RuleList.vue";

const props = defineProps<{ nodeLabel: string }>();
const store = useStore();
const query = ref("");
const sizeType = ref<"compare" | "map">("compare");
const size = ref(20);
const min = ref(5);
const max = ref(40);

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
  store.dispatch("addRule", {
    type: "size",
    searchObject: generateSearchObject(`${props.nodeLabel}: ${query.value}`),
    searchString: query.value,
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
      <SearchQueryInput
        v-model="query"
        :fixed-node-type="nodeLabel"
        :label="`Size rule condition for ${nodeLabel}`"
        :placeholder="
          sizeType === 'map'
            ? 'popularity (choose one attribute)'
            : 'popularity>50'
        "
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
