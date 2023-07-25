<template>
  <div>
    <div class="container" v-for="edgeLabel in getEdges(nodeLabel)" v-bind:key="edgeLabel">

      <label class="checkbox-container">
        <input type='checkbox' v-model='selectedExpandOptions'
          v-bind:value='{ "nodeLabel": nodeLabel, "edgeLabel": edgeLabel }' @change='updateGraphModificationConfiguration({
            actionType: "expand", selectedOptions: selectedExpandOptions, nodeType: nodeLabel
          })' />
        <span class="box">e</span>
      </label>
      <label class="checkbox-container">
        <input type='checkbox' v-model='selectedCollapseOptions'
          v-bind:value='{ "nodeLabel": nodeLabel, "edgeLabel": edgeLabel }'
          @change='updateGraphModificationConfiguration({ actionType: "collapse", selectedOptions: selectedCollapseOptions, nodeType: nodeLabel })' />
        <span class="box">c</span>
      </label>
      {{ edgeLabel }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  data: () => ({
    selectedExpandOptions: [],
    selectedCollapseOptions: []
  }),
  props: [
    'nodeLabel'
  ],
  methods: {
    ...mapActions([
      'updateGraphModificationConfiguration'
    ]),
    ...mapGetters([
      'getNodeLabelNames',
      'getEdgeNamesForNodeLabel'
    ]),
    getEdges(label) {
      return this.getEdgeNamesForNodeLabel()(label)
    },
    convertActionConfigurationToOptions(configuration) {
      const options = configuration.flatMap((nodeType) => {
        return nodeType.edges.map((edgeType) => {
          return { "nodeLabel": nodeType.nodeType, "edgeLabel": edgeType }
        })
      }).filter(config => config.nodeLabel === this.nodeLabel)
      return options
    }
  },
  watch: {
    nodeLabel: function () {
      this.selectedExpandOptions = this.convertActionConfigurationToOptions(this.$store.state.configurations.actionConfiguration.expand)
      this.selectedCollapseOptions = this.convertActionConfigurationToOptions(this.$store.state.configurations.actionConfiguration.collapse)
    }
  },
  mounted: function () {
    this.selectedExpandOptions = this.convertActionConfigurationToOptions(this.$store.state.configurations.actionConfiguration.expand)
    this.selectedCollapseOptions = this.convertActionConfigurationToOptions(this.$store.state.configurations.actionConfiguration.collapse)
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "UPDATE_EXPAND_CONFIGURATION") {
        this.selectedExpandOptions = this.convertActionConfigurationToOptions(state.configurations.actionConfiguration.expand)
      }
      else if (mutation.type === "UPDATE_COLLAPSE_CONFIGURATION") {
        this.selectedCollapseOptions = this.convertActionConfigurationToOptions(state.configurations.actionConfiguration.collapse)
      }
      else if (mutation.type === "SET_CONFIGURATION") {
        this.selectedExpandOptions = this.convertActionConfigurationToOptions(state.configurations.actionConfiguration.expand)
        this.selectedCollapseOptions = this.convertActionConfigurationToOptions(state.configurations.actionConfiguration.collapse)
      }
    })
  }
}
</script>

<style scoped>
.container:nth-child(odd) {
  background: rgb(255, 255, 255);
}

.container:nth-child(even) {
  background: rgb(236, 236, 236);
}

.container {
  padding: 0.5rem;
}

[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  cursor: pointer;
}

[type=checkbox]:checked+.box {
  background-color: #1dcdda;
  border: 1px solid #1dcdda;
  color: white;
}

[type=checkbox]:hover+.box {
  background-color: #0d676d;
  color: white;
}

[type=checkbox]+.box {
  /* background-color: #da6a1dff; */
  border: 1px solid #da6a1d;
  background-color: white;
  color: #da6a1d;
  padding-left: 5px;
  padding-right: 5px;
  cursor: pointer;
  margin-top: 1rem;
  width: 15px;
  margin-right: 3px;
}
</style>
