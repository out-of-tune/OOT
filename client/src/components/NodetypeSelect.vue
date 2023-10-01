<template>
  <div>
    <select
      class="select"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
      <option class="option" v-for="option in getSimpleSearchNodeTypes()" :key="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);

const store = useStore();

const nodeLabels = computed(() => store.getters.getNodeLabelNames);

function getSimpleSearchNodeTypes() {
  return ["any", ...nodeLabels.value];
}
</script>

<style>
.select {
  border: 1px solid #fff;
  padding: 0.25rem;
  background-color: #ababab;
}
</style>
