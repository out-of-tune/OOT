<template>
  <div id="settings">
    <div class="nav-buttons">
      <v-btn
        small
        dark
        color="#da6a1d"
        class="btn"
        id="open"
        @click="openPage='nodeConfiguration'"
      >Node Configuration</v-btn>
      <v-btn
        small
        dark
        color="#0d676d"
        class="btn"
        id="configOpen"
        @click="openPage='edgeConfiguration'"
      >Edge Configuration</v-btn>
      <v-btn
        small
        dark
        color="#1dcdda"
        class="btn"
        id="open"
        @click="openPage='generalConfiguration'"
      >General settings</v-btn>
    </div>
    <div id="nodeSettings" v-if="openPage==='nodeConfiguration'">
      <span id="blank"></span>
      <h2
        v-for="nodeLabel in getNodeLabelNames()"
        v-bind:key="nodeLabel"
        class="nodeLabel"
      >{{nodeLabel}}</h2>
      <h2 id="expand">expand/collapse</h2>
      <GraphModificationOption
        class="setting1"
        v-for="nodeLabel in getNodeLabelNames()"
        v-bind:key="nodeLabel+1"
        :nodeLabel="nodeLabel"
      ></GraphModificationOption>
      <h2 id="color">color</h2>
      <AppearanceMappingColorOption
        class="setting2"
        v-for="nodeType in nodeTypes"
        v-bind:key="nodeType.label+2"
        :nodeType="nodeType"
      ></AppearanceMappingColorOption>
      <h2 id="size">size</h2>
      <AppearanceMappingSizeOption
        class="setting3"
        v-for="nodeType in nodeTypes"
        v-bind:key="nodeType.label+3"
        :nodeType="nodeType"
      ></AppearanceMappingSizeOption>
      <h2 id="tooltipOption">tooltip</h2>
      <AppearanceMappingTooltipOption
        class="setting4"
        v-for="(nodeType, index) in nodeTypes"
        v-bind:key="nodeType.label+4"
        :nodeType="nodeType"
        :index="index"
      ></AppearanceMappingTooltipOption>
    </div>
    <div id="edgeSettings" v-if="openPage==='edgeConfiguration'">
      <h2>Color</h2>
      <AppearanceMappingEdgeColor></AppearanceMappingEdgeColor>
    </div>
    <div id="generalSettings" v-if="openPage==='generalConfiguration'">
      <div class="settingsCard">
        <div class="settingsCardTitle">Show tutorial</div>
        <v-switch color="#da6a1d" class="settingsSwitch" v-model="showTour" dark></v-switch>
        <div class="settingsCardText">Shows the startup tour in the out-of-tune main window.</div>
      </div>
      <!-- <div class="settingsCard">
        <div class="settingsCardTitle">Performance Mode</div>
        <v-switch color="#da6a1d" class="settingsSwitch" v-model="showTour" dark></v-switch>
        <div class="settingsCardText">Disables labels on zoom, highlighting of edges in selection, </div>
      </div> -->
    </div>
    <div class="space"></div>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import GraphModificationOption from "@/components/options/GraphModificationOption";
import AppearanceMappingColorOption from "@/components/options/AppearanceMappingColorOption";
import AppearanceMappingSizeOption from "@/components/options/AppearanceMappingSizeOption";
import AppearanceMappingTooltipOption from "@/components/options/AppearanceMappingTooltipOption";
import AppearanceMappingEdgeColor from "@/components/options/AppearanceMappingEdgeColor";

export default {
  components: {
    GraphModificationOption,
    AppearanceMappingColorOption,
    AppearanceMappingSizeOption,
    AppearanceMappingTooltipOption,
    AppearanceMappingEdgeColor
  },
  data: () => {
    return {
      openPage: "nodeConfiguration"
    };
  },
  methods: {
    ...mapGetters(["getNodeLabelNames"]),
    ...mapActions(["setShowTour"])
  },
  computed: {
    ...mapState({
      nodeTypes: state => state.schema.nodeTypes
    }),
    showTour: {
      get() {
        return this.$store.state.events.showTour;
      },
      set(value) {
        this.setShowTour(value);
      }
    }
  }
};
</script>
<style scoped>
.btn {
  color: white;
}
#settings {
  padding-top: 70px;
  padding-left: 20px;
  padding-right: 50px;
  display: grid;
  background-color: black;
  justify-items: center;
  min-height: 100%;
}
#generalSettings {
  color: white;
}
.nav-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding-right: 2rem;
  padding-left: 2rem;
}
#nodeSettings {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 100px minmax(150px, 1fr) 1fr 1fr minmax(100px, 1fr);
  grid-auto-flow: column;
  background-color: black;
}
#edgeSettings {
  display: grid;
}
.panel-body {
  background: rgb(187, 187, 187);
}
.card {
  margin: 1rem;
}
h2 {
  color: white;
}
#blank {
  grid-column-start: 1;
  grid-row-start: 1;
}
.nodeLabel {
  grid-column-start: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.setting1 {
  grid-column-start: 2;
}
.setting2 {
  grid-column-start: 3;
  color: white;
}
.setting3 {
  grid-column-start: 4;
  color: white;
}
.setting4 {
  grid-column-start: 5;
  color: white;
}
.setting1:nth-child(even) {
  background-color: #494949;
}
.setting1:nth-child(odd) {
  background-color: #222222;
}
.setting2:nth-child(odd) {
  background-color: #494949;
}
.setting2:nth-child(even) {
  background-color: #222222;
}
.setting3:nth-child(even) {
  background-color: #494949;
}
.setting3:nth-child(odd) {
  background-color: #222222;
}
.setting4:nth-child(odd) {
  background-color: #494949;
}
.setting4:nth-child(even) {
  background-color: #222222;
}
.nodeLabel:nth-child(odd) {
  background-color: #494949;
}
.nodeLabel:nth-child(even) {
  background-color: #222222;
}
#expand {
  grid-column-start: 2;
  grid-row-start: 1;
}
#color {
  grid-column-start: 3;
  grid-row-start: 1;
}
#size {
  grid-column-start: 4;
  grid-row-start: 1;
}
#tooltipOption {
  grid-column-start: 5;
  grid-row-start: 1;
}
.space {
  height: 220px;
  background: black;
}
.settingsCard {
  display: grid;
  grid-template-columns: 1fr 1rem;
  grid-template-rows: 1fr 1fr;
  border-bottom: 1px solid #ffffff22;
}
.settingsSwitch {
  margin: 0;
}
:deep() .v-messages {
  min-height: 0 !important;
  height: 0 !important;
}
.settingsCardTitle {
  font-size: 1.5rem;
  font-weight: bold;
}
.settingsCardText {
}
</style>
