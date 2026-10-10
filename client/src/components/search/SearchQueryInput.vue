<script setup lang="ts">
import { computed, ref, useId } from "vue";
import {
  buildAttributeQuery,
  generateSearchObject,
  getAttributes,
  getMatchingData,
} from "@/lib/search/searchObject";
import { useStore } from "@/store";
import type { SearchObject } from "@/types/search";

/**
 * Text input for the advanced search syntax (`artist: name="Bob" popularity>50`)
 * with autocomplete for node types and attributes.
 * With `fixedNodeType` the user types only the attributes, and the node type is implied.
 */
const props = defineProps<{
  fixedNodeType?: string;
  placeholder?: string;
  label: string;
}>();

const emit = defineEmits<{
  "update:searchObject": [searchObject: SearchObject];
  submit: [];
}>();

const text = defineModel<string>({ default: "" });

const store = useStore();
const listId = useId();
const focused = ref(false);
const activeIndex = ref(-1);

const fullQuery = (value: string) =>
  props.fixedNodeType ? `${props.fixedNodeType}: ${value}` : value;

const searchObject = computed(() =>
  generateSearchObject(fullQuery(text.value)),
);

const suggestions = computed(() => {
  const tip = searchObject.value.tip;
  if (!tip) return [];
  if (tip.type === "attribute") {
    return getMatchingData(
      tip,
      getAttributes(tip.nodeType, store.state.schema.nodeTypes),
    );
  }
  if (props.fixedNodeType) return [];
  return getMatchingData(tip, store.getters.getNodeLabelNames as string[]);
});

const showSuggestions = computed(
  () => focused.value && suggestions.value.length > 0,
);

function update(value: string) {
  text.value = value;
  activeIndex.value = -1;
  emit("update:searchObject", generateSearchObject(fullQuery(value)));
}

function pick(suggestion: string) {
  const tip = searchObject.value.tip;
  if (tip?.type === "attribute") {
    const attributes = buildAttributeQuery(searchObject.value, suggestion);
    update(
      props.fixedNodeType
        ? attributes
        : `${searchObject.value.nodeType}: ${attributes}`,
    );
  } else if (tip?.type === "nodeType") {
    update(suggestion);
  }
}

function onKeydown(event: KeyboardEvent) {
  const count = suggestions.value.length;
  if (event.key === "ArrowDown" && count > 0) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % count;
  } else if (event.key === "ArrowUp" && count > 0) {
    event.preventDefault();
    activeIndex.value =
      activeIndex.value <= 0 ? count - 1 : activeIndex.value - 1;
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (showSuggestions.value && activeIndex.value >= 0)
      pick(suggestions.value[activeIndex.value]);
    else emit("submit");
  } else if (event.key === "Escape") {
    focused.value = false;
  }
}
</script>

<template>
  <div class="relative w-full">
    <input
      :value="text"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      :aria-label="label"
      :aria-expanded="showSuggestions"
      :aria-controls="listId"
      :aria-activedescendant="
        activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
      "
      :aria-invalid="text !== '' && !searchObject.valid"
      :placeholder="placeholder"
      class="field font-mono text-[13px]"
      :class="
        text !== '' && (searchObject.valid ? 'text-success' : 'text-danger')
      "
      @input="update(($event.target as HTMLInputElement).value)"
      @focus="focused = true"
      @blur="focused = false"
      @keydown="onKeydown"
    />
    <ul
      v-if="showSuggestions"
      :id="listId"
      role="listbox"
      class="panel scrollbar-thin absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto bg-surface-raised py-1"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${listId}-${index}`"
        :key="suggestion"
        role="option"
        :aria-selected="index === activeIndex"
        class="cursor-pointer px-3 py-1.5 font-mono text-[13px]"
        :class="
          index === activeIndex
            ? 'bg-accent/20 text-fg'
            : 'text-fg-muted hover:bg-surface-hover'
        "
        @mousedown.prevent="pick(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>
