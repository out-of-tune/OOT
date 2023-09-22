<template>
  <div>
    <div id="options">
      <AppearanceMappingInput
        id="input"
        :searchObject="searchObject"
        :searchString="searchString"
        v-on:update:searchObject="searchObject = $event"
        v-on:update:searchString="searchString = $event"
      ></AppearanceMappingInput>
      <div class="field">
        <label for="size">size</label>
        <input id="size" type="number" v-model="size" />
        <button class="btn" v-on:click="addSizeRule">add</button>
      </div>
      <div class="field">
        <label for="minValue">min</label>
        <input type="number" name="minValue" id="minValue" v-model="min" />
        <label for="maxValue">max</label>
        <input type="number" name="maxValue" id="maxValue" v-model="max" />
        <button class="btn" id="mapAdd" v-on:click="addMapSizeRule">add</button>
      </div>
    </div>
    <div class="list">
      <draggable :nodeType="nodeType"></draggable>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import Draggable from "./SizeDraggable.vue";
import AppearanceMappingInput from "@/components/helpers/AppearanceMappingInput";
export default {
  components: {
    Draggable,
    AppearanceMappingInput,
  },
  props: ["nodeType"],
  data: () => ({
    size: 10,
    min: 0,
    max: 100,
    searchObject: {
      nodeType: "",
      valid: true,
      errors: [],
      attributes: [],
      tip: { text: "" },
    },
    searchString: "",
  }),
  methods: {
    addSizeRule: function () {
      const size = parseInt(this.size);
      if (Number.isInteger(size)) {
        this.addRule({
          type: "size",
          searchObject: this.searchObject,
          searchString: this.searchString,
          sizeType: "compare",
          size,
        });
      } else {
        this.setError(new Error("rule could not be added: size is invalid"));
      }
    },
    addMapSizeRule: function () {
      const min = parseInt(this.min);
      const max = parseInt(this.max);
      if (Number.isInteger(min) && Number.isInteger(max)) {
        this.addRule({
          type: "size",
          searchObject: this.searchObject,
          searchString: this.searchString,
          sizeType: "map",
          min,
          max,
        });
      } else {
        this.setError(
          new Error("rule could not be added: min/max values are invalid")
        );
      }
    },
    ...mapActions(["addRule", "setError", "setSuccess"]),
  },
  created: function () {
    this.searchObject.nodeType = this.nodeType.label;
    this.searchObject.tip.nodeType = this.nodeType.label;
    this.searchObject.tip.type = "attribute";
  },
};
</script>
<style scoped>
input {
  background: white;
  color: black;
}
select {
  background: white;
  color: black;
}
.field {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 0.5rem;
}
#mapAdd {
  grid-area: 1 / 3 / 3 / 4;
  justify-self: center;
  align-self: center;
}
#options {
  display: grid;
  grid-gap: 1rem;
  padding: 1rem;
}
.list {
  padding: 0.5rem;
}
h1 {
  padding: 0.5rem;
  color: white;
}
#input {
  width: 100%;
}
.btn {
  margin: 0;
  padding: 0;
  min-width: 50px;
}
</style>
