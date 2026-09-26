<script setup lang="ts">
import { GripVertical, X } from "@lucide/vue";
import { computed } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useStore } from "@/store";
import type {
  ColorRule,
  NodeRule,
  NodeRuleType,
  SizeRule,
} from "@/types/configuration";

/** The rules of one node type, without the default rule. Later rules win, so the order matters. */
const props = defineProps<{ nodeLabel: string; type: NodeRuleType }>();
const store = useStore();

const rules = computed<NodeRule[]>({
  get: () => {
    const rulesets =
      store.state.configurations.appearanceConfiguration.nodeConfiguration[
        props.type
      ];
    const ruleset = rulesets.find(
      (entry) => entry.nodeLabel === props.nodeLabel,
    );
    return ruleset ? ruleset.rules.slice(1) : [];
  },
  set: (ruleset) => {
    store.dispatch("updateRuleset", {
      ruleset,
      nodeLabel: props.nodeLabel,
      type: props.type,
    });
  },
});

function remove(index: number) {
  rules.value = rules.value.filter((_, position) => position !== index);
}

const colorOf = (rule: NodeRule) =>
  `#${(rule as ColorRule).color?.substring(0, 6) ?? "ffffff"}`;

function describeSize(rule: NodeRule) {
  const sizeRule = rule as SizeRule;
  return sizeRule.sizeType === "map"
    ? `${sizeRule.min}–${sizeRule.max}`
    : String(sizeRule.size);
}

function describeSearch(rule: NodeRule) {
  const sizeRule = rule as SizeRule;
  if (sizeRule.sizeType === "map")
    return `map ${sizeRule.searchObject.attributes[0]?.attributeSearch ?? ""}`;
  return rule.searchString || "all";
}
</script>

<template>
  <p v-if="rules.length === 0" class="text-xs text-fg-subtle">
    No rules yet. Only the default applies.
  </p>
  <VueDraggable
    v-else
    v-model="rules"
    tag="ul"
    :animation="150"
    handle=".rule-handle"
    class="flex flex-col gap-1"
  >
    <li
      v-for="(rule, index) in rules"
      :key="`${rule.searchString}-${index}`"
      class="flex items-center gap-2 rounded-md border border-line bg-surface-raised py-1 pr-1 pl-1.5 text-xs"
    >
      <GripVertical
        class="rule-handle size-3.5 shrink-0 cursor-grab text-fg-subtle"
      />
      <span
        v-if="type === 'color'"
        class="size-3.5 shrink-0 rounded-sm border border-white/20"
        :style="{ backgroundColor: colorOf(rule) }"
      />
      <span
        v-else
        class="shrink-0 rounded bg-surface-hover px-1.5 font-mono tabular-nums"
        >{{ describeSize(rule) }}</span
      >
      <span
        class="min-w-0 flex-1 truncate font-mono text-fg-muted"
        :title="rule.searchString"
        >{{ describeSearch(rule) }}</span
      >
      <button
        type="button"
        :aria-label="`Remove rule ${rule.searchString}`"
        class="rounded p-0.5 text-fg-subtle hover:bg-surface-hover hover:text-danger"
        @click="remove(index)"
      >
        <X class="size-3.5" />
      </button>
    </li>
  </VueDraggable>
</template>
