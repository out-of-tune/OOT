<template>
  <Popper placement="top">
    <button class="icon-btn tooltip">
      <v-icon class="icon" color="white" name="md-save" />
      <span class="tooltiptext">SAVE/LOAD</span>
    </button>
    <template #content>
      <div>
        <div class="menu">
          <h2>SAVE / LOAD</h2>

          <div class="nav-buttons">
            <button
              class="btn tabButton"
              :class="{ active: configuration }"
              @click="configuration = true"
            >
              Configuration
            </button>
            <button
              class="btn tabButton"
              :class="{ active: !configuration }"
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
import LoadSaveConfigurationOption from "@/components/options/LoadSaveConfigurationOption.vue";
import LoadSaveGraphOption from "@/components/options/LoadSaveGraphOption.vue";

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
.menu {
  background: #252525;
  padding: 0.5rem;
  width: 450px;
}
.loadSaveActions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.active {
  background: #2d9cdb;
}
</style>
