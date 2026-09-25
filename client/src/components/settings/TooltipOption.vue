<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import type { SchemaNodeType } from "@/types/schema";

const props = defineProps<{ nodeType: SchemaNodeType }>();
const store = useStore();

const rules = computed(
  () =>
    store.state.configurations.appearanceConfiguration.nodeConfiguration
      .tooltip,
);
const attribute = computed({
  get: () =>
    rules.value.find((rule) => rule.nodeLabel === props.nodeType.label)
      ?.attribute ?? "name",
  set: (value: string) => {
    const others = rules.value.filter(
      (rule) => rule.nodeLabel !== props.nodeType.label,
    );
    store.dispatch("updateTooltipRules", {
      rules: [...others, { nodeLabel: props.nodeType.label, attribute: value }],
    });
  },
});
</script>

<template>
  <select
    v-model="attribute"
    :aria-label="`Tooltip attribute for ${nodeType.label}`"
    class="field"
  >
    <option v-for="option in nodeType.attributes" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>
