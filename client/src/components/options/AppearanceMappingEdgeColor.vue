<template>
  <div>
    <div class="card" v-for="(edgeType, index) in edgeTypes" v-bind:key="index">
      <AppearanceMappingEdgeColorOption
        :index="index"
        :edgeType="edgeType"
      ></AppearanceMappingEdgeColorOption>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import AppearanceMappingEdgeColorOption from "./AppearanceMappingEdgeColorOption";
export default {
  components: {
    AppearanceMappingEdgeColorOption,
  },
  computed: {
    ...mapState({
      edgeTypes: (state) => state.schema.edgeTypes,
    }),
  },
};
</script>
<style scoped>
.field {
  display: grid;
  grid-template-columns: 100px 150px;
}
.card {
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  margin-bottom: 1rem;
}
</style>
