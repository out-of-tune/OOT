<template>
    <div class="text-xs-center popover">
      <v-menu dark v-model="loadSaveMenu" :close-on-content-click="false" :nudge-width="100">
        <template v-slot:activator="{ on }">
          <button class="container tooltip" v-on="on"><v-icon class="icon" color="white" icon="mdi-content-save"/>
          <span class="tooltiptext">SAVE/LOAD</span>
          </button>
        </template>

        <v-card class="menu">
          <h2 id="menu-header">SAVE / LOAD</h2>

          <v-divider></v-divider>
          <div class="nav-buttons">
            <v-btn id="configurationTab" class="tabButton" :class="{active: configuration}" small color="#da6a1d" @click="configuration=true">Configuration</v-btn>
            <v-btn small class="tabButton" id="graphTab" :class="{active: !configuration}" color="#0d676d" @click="configuration=false">Graph</v-btn>
          </div>
          <v-card-actions v-if="configuration" id="loadSaveConfiguration" class="loadSaveActions">
            <LoadSaveConfigurationOption></LoadSaveConfigurationOption>
          </v-card-actions>
          <v-card-actions v-else id="loadSaveGraph" class="loadSaveActions">
            <LoadSaveGraphOption></LoadSaveGraphOption>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
</template>
<script>
import LoadSaveConfigurationOption from '@/components/options/LoadSaveConfigurationOption'
import LoadSaveGraphOption from '@/components/options/LoadSaveGraphOption'

export default {
    data: ()=>{
      return{
        loadSaveMenu: false,
        configuration: true
    }},
    components: {
        LoadSaveConfigurationOption,
        LoadSaveGraphOption
    },
}
</script>
<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  background-color: #0d676d;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
  top: -1px;
  right: 110%;
}

.menu {
  padding: 1rem;
}

.container:hover {
  background-color: #1dcdda66;
}

.container:active {
  background-color: #1dcddaff;
}

.container {
  background-color: #da6a1dff;
  padding: 3px;
  cursor: pointer;
  height: 30px;
}

.btn {
    background: #FFFFFF;
    border: 1px solid #2D9CDB;
    box-sizing: border-box;
    box-shadow: 1px 1px 4px rgba(45, 156, 219, 0.25);
    border-radius: 5px;
    padding: 3px;
    margin-right: 1rem;
    width: 100px;
    margin-bottom: 1rem;
}

.btn-orange {
    background: #424242;
    border: 1px solid #F2994A;
    box-sizing: border-box;
    box-shadow: 1px 1px 4px rgba(242, 152, 74, 0.25);
    border-radius: 5px;
    padding: 3px;
    margin-right: 1rem;
    width: 100px;
    margin-bottom: 1rem;
}

.btn-orange:hover {
    background: linear-gradient(180deg, #F2994A 0%, rgb(240, 131, 35) 100%);    
    color: white;
}

.btn:active {
    background: #2D9CDB;
}

.btn:hover {
    background: linear-gradient(180deg, #2D9CDB 0%, #56CCF2 100%);    
    color: white;
}
.loadSaveActions {
  display: grid;
}
/* #loadSaveGraph {
  border: 2px solid #0d676d;
}
#loadSaveConfiguration {
  border: 2px solid #da6a1d;
} */
#spacer{
  margin: 1rem;
}
.tabButton{
  color: white;
  border: 2px solid #ffffff;
  margin-left:0;
  margin-right:0;
}
#graphTab{
  margin-left: 2px;
}
.active {
  transition: 0.2s;
  background-color: #424242 !important;
  color: white !important;
  box-shadow: none !important;
}

</style>
