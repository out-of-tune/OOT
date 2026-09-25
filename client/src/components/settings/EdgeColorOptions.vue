<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const edgeTypes = computed(() => store.state.schema.edgeTypes);
const rules = computed(
  () =>
    store.state.configurations.appearanceConfiguration.edgeConfiguration.color,
);

const colorOf = (edgeLabel: string) =>
  `#${rules.value.find((rule) => rule.edgeLabel === edgeLabel)?.color.substring(0, 6) ?? "ffffff"}`;

/** Keeps the alpha channel of the rule. The color input has no alpha. */
function setColor(edgeLabel: string, value: string) {
  const existing = rules.value.find((rule) => rule.edgeLabel === edgeLabel);
  const alpha = existing?.color.substring(6, 8) || "ff";
  const updated = { edgeLabel, color: `${value.substring(1)}${alpha}` };
  store.dispatch("updateEdgeRules", {
    rules: existing
      ? rules.value.map((rule) =>
          rule.edgeLabel === edgeLabel ? updated : rule,
        )
      : [...rules.value, updated],
  });
}
</script>

<template>
  <ul class="flex flex-col divide-y divide-line">
    <li
      v-for="edgeType in edgeTypes"
      :key="edgeType.label"
      class="flex items-center justify-between gap-4 py-3"
    >
      <div>
        <p class="text-sm font-medium">
          {{ edgeType.label.replaceAll("_", " ") }}
        </p>
        <p class="text-xs text-fg-subtle">
          {{ edgeType.inbound.from }} → {{ edgeType.inbound.to }}
        </p>
      </div>
      <input
        type="color"
        :value="colorOf(edgeType.label)"
        :aria-label="`Color of ${edgeType.label} edges`"
        class="h-9 w-14 cursor-pointer rounded-lg border border-line bg-surface-raised p-1"
        @change="
          setColor(edgeType.label, ($event.target as HTMLInputElement).value)
        "
      />
    </li>
  </ul>
</template>
