<template>
  <div class="slider" @click="handleClick">
    <div class="progress" :style="{ width: width + '%' }"></div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps(["modelValue", "min", "max"]);
const emit = defineEmits(["update:modelValue"]);

let width = computed(() => {
  let p = (props.modelValue / (props.max - props.min)) * 100;
  return p;
});

const handleClick = (e) => {
  let p = e.offsetX / e.target.clientWidth;
  let value = p * (props.max - props.min);
  emit("update:modelValue", value);
};
</script>

<style scoped>
.slider {
  background-color: #404040;
  width: 100%;
  display: flex;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
}

.progress {
  background-color: #ff9b00;
  height: 0.3rem;
  transition: width 0.3s;
  display: flex;
  justify-content: end;
  pointer-events: none;
}
</style>
