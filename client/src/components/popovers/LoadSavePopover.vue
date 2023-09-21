<template>
  <Popper placement="top">
    <button class="container tooltip">
      <v-icon class="icon" color="white" icon="mdi-content-save" />
      <span class="tooltiptext">SAVE/LOAD</span>
    </button>
    <template #content>
      <div>
        <div class="menu">
          <h2 id="menu-header">SAVE / LOAD</h2>

          <div class="nav-buttons">
            <button
              id="configurationTab"
              class="tabButton"
              :class="{ active: configuration }"
              color="#da6a1d"
              @click="configuration = true"
            >
              Configuration
            </button>
            <button
              class="tabButton"
              id="graphTab"
              :class="{ active: !configuration }"
              color="#0d676d"
              @click="configuration = false"
            >
              Graph
            </button>
          </div>
          <div
            v-if="configuration"
            id="loadSaveConfiguration"
            class="loadSaveActions"
          >
            <LoadSaveConfigurationOption></LoadSaveConfigurationOption>
          </div>
          <div v-else id="loadSaveGraph" class="loadSaveActions">
            <LoadSaveGraphOption></LoadSaveGraphOption>
          </div>
        </div>
      </div>
    </template>
  </Popper>
</template>
<script>
import LoadSaveConfigurationOption from "@/components/options/LoadSaveConfigurationOption";
import LoadSaveGraphOption from "@/components/options/LoadSaveGraphOption";

import Popper from "vue3-popper";

export default {
  data: () => {
    return {
      loadSaveMenu: false,
      configuration: true,
    };
  },
  components: {
    LoadSaveConfigurationOption,
    LoadSaveGraphOption,
    Popper,
  },
};
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
  background-color: #434343;
  width: 500px;
  height: 300px;
  overflow-y: scroll;
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
  background: #ffffff;
  border: 1px solid #2d9cdb;
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
  border: 1px solid #f2994a;
  box-sizing: border-box;
  box-shadow: 1px 1px 4px rgba(242, 152, 74, 0.25);
  border-radius: 5px;
  padding: 3px;
  margin-right: 1rem;
  width: 100px;
  margin-bottom: 1rem;
}

.btn-orange:hover {
  background: linear-gradient(180deg, #f2994a 0%, rgb(240, 131, 35) 100%);
  color: white;
}

.btn:active {
  background: #2d9cdb;
}

.btn:hover {
  background: linear-gradient(180deg, #2d9cdb 0%, #56ccf2 100%);
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
#spacer {
  margin: 1rem;
}
.tabButton {
  color: white;
  border: 2px solid #ffffff;
  margin-left: 0;
  margin-right: 0;
}
#graphTab {
  margin-left: 2px;
}
.active {
  transition: 0.2s;
  background-color: #424242 !important;
  color: white !important;
  box-shadow: none !important;
}
</style>
