<template>
  <div id="options">
    <AppearanceMappingInput
      :searchObject="searchObject"
      :searchString="searchString"
      v-on:update:searchObject="searchObject = $event"
      v-on:update:searchString="searchString = $event"
      v-on:addRule="addColorRule"
    ></AppearanceMappingInput>
    <div class="field">
      <label for="color">color </label>
      <input id="color" type="color" v-model="color" />
      <button class="btn" v-on:click="addColorRule">add</button>
    </div>
    <div class="list">
      <draggable :nodeType="nodeType"></draggable>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import Draggable from "./ColorDraggable.vue";
import AppearanceMappingInput from "@/components/helpers/AppearanceMappingInput.vue";
export default {
  components: {
    Draggable,
    AppearanceMappingInput,
  },
  props: ["nodeType"],
  data: () => ({
    color: "#ffffff",
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
    addColorRule: function () {
      const color = this.color.substring(1) + "ff";
      this.addRule({
        type: "color",
        searchObject: this.searchObject,
        searchString: this.searchString,
        color,
      });
    },
    ...mapActions(["addRule"]),
  },
  created: function () {
    this.searchObject.nodeType = this.nodeType.label;
    this.searchObject.tip.nodeType = this.nodeType.label;
    this.searchObject.tip.type = "attribute";
  },
};
</script>
<style scoped>
.field {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  justify-items: center;
}
.list {
  padding: 0.5rem;
}
#options {
  padding: 1rem;
}
#color {
  width: 100%;
}
.btn {
  margin: 0;
  padding: 0;
  min-width: 50px;
}
</style>
