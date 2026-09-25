<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const props = defineProps<{ nodeLabel: string }>();
const store = useStore();

const edges = computed(() =>
  (store.getters.getEdgeNamesForNodeLabel as (label: string) => string[])(
    props.nodeLabel,
  ),
);

const configured = (actionType: "expand" | "collapse") =>
  store.state.configurations.actionConfiguration[actionType].find(
    (rule) => rule.nodeType === props.nodeLabel,
  )?.edges ?? [];

const expandEdges = computed(() => configured("expand"));
const collapseEdges = computed(() => configured("collapse"));

function toggle(
  actionType: "expand" | "collapse",
  edgeLabel: string,
  enabled: boolean,
) {
  const current = configured(actionType);
  const next = enabled
    ? [...new Set([...current, edgeLabel])]
    : current.filter((edge) => edge !== edgeLabel);
  store.dispatch("updateGraphModificationConfiguration", {
    actionType,
    nodeType: props.nodeLabel,
    selectedOptions: next.map((edge) => ({ edgeLabel: edge })),
  });
}
</script>

<template>
  <table class="w-full text-sm">
    <thead>
      <tr class="text-left text-xs text-fg-subtle">
        <th class="pb-1 font-normal">Edge</th>
        <th class="w-16 pb-1 text-center font-normal">Expand</th>
        <th class="w-16 pb-1 text-center font-normal">Collapse</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="edge in edges" :key="edge" class="border-t border-line/60">
        <td class="py-1.5 font-mono text-xs text-fg-muted">
          {{ edge.replaceAll("_", " ") }}
        </td>
        <td class="text-center">
          <input
            type="checkbox"
            class="size-4 accent-teal"
            :aria-label="`Expand follows ${edge}`"
            :checked="expandEdges.includes(edge)"
            @change="
              toggle(
                'expand',
                edge,
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
        </td>
        <td class="text-center">
          <input
            type="checkbox"
            class="size-4 accent-brand"
            :aria-label="`Collapse removes ${edge}`"
            :checked="collapseEdges.includes(edge)"
            @change="
              toggle(
                'collapse',
                edge,
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>
