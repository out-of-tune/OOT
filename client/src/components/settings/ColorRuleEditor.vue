<script setup lang="ts">
import { ref } from "vue";
import SearchQueryInput from "@/components/search/SearchQueryInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import { searchObjectForType } from "@/lib/search/searchObject";
import { useStore } from "@/store";
import RuleList from "./RuleList.vue";

const props = defineProps<{ nodeLabel: string }>();
const store = useStore();
const query = ref("");
const color = ref("#ffffff");

function addRule() {
  store.dispatch("addRule", {
    type: "color",
    searchObject: searchObjectForType(props.nodeLabel, query.value),
    searchString: query.value,
    color: `${color.value.substring(1)}ff`,
  });
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <form class="flex items-center gap-1.5" @submit.prevent="addRule">
      <SearchQueryInput
        v-model="query"
        :fixed-node-type="nodeLabel"
        :label="`Color rule condition for ${nodeLabel}`"
        placeholder="name=Björk"
        @submit="addRule"
      />
      <input
        v-model="color"
        type="color"
        :aria-label="`Color for ${nodeLabel}`"
        class="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-line bg-surface-raised p-1"
      />
      <UiButton type="submit">Add</UiButton>
    </form>
    <RuleList :node-label="nodeLabel" type="color" />
  </div>
</template>
