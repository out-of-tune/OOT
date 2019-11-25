<template>
    <div class="card">
        <v-select
            :items="getNodeLabelNames()"
            v-model="selectedNode"
            v-on:change="deselectEdge"
            label="Label"
            solo
        ></v-select>
        <v-select
            :items="getEdges(selectedNode)"
            v-model="selectedEdge"
            label="Label"
            solo
        ></v-select>
        <v-btn name="ADD" v-on:click="addNodes()">ADD</v-btn>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => {return {
    selectedNode: null,
    selectedEdge: null,
    items: []
  }},
  methods: {
    ...mapActions(["generateInceptionGraph"]),
    ...mapGetters(["getNodeLabelNames", "getEdgeNamesForNodeLabel"]),
    getEdges(label) {
      return this.getEdgeNamesForNodeLabel()(label);
    },
    addNodes(){
        if(this.selectedNode && this.selectedEdge){
            this.generateInceptionGraph({nodeType: this.selectedNode,connectionType: this.selectedEdge})
        }
    },
    deselectEdge(){
        this.selectedEdge= null
    }
  },
  mounted: function() {}
};
</script>

<style scoped>
.textfield {
  width: 200px;
}

.card {
  /* background-color: #00848d; */
  padding: 1rem;
  display: grid;
}

h1 {
  color: white;
}
</style>