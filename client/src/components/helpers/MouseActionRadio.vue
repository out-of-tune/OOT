<template>
  <div class="click-actions">
    <button
      class="icon-btn tooltip"
      :class="{ selected: activeMode === 'expand' }"
      @click="expandClickHandler"
    >
      <label id="expand-button" for="expand">
        <v-icon class="icon" color="white" name="md-add" />
        <span class="tooltiptext">EXPAND</span>
      </label>
    </button>
    <button
      class="icon-btn tooltip"
      :class="{ selected: activeMode === 'collapse' }"
      @click="collapseClickHandler"
    >
      <label id="collapse-button" for="collapse">
        <v-icon class="icon" color="white" name="md-remove" />
        <span class="tooltiptext">COLLAPSE</span>
      </label>
    </button>
    <button
      class="icon-btn tooltip"
      :class="{ selected: activeMode === 'explore' }"
      @click="exploreClickHandler"
    >
      <label id="explore-button" for="explore">
        <v-icon class="icon" color="white" name="md-musicnote" />
        <span class="tooltiptext">EXPLORE</span>
      </label>
    </button>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      activeMode: (state) => state.activeMode,
    }),
  },
  methods: {
    ...mapActions(["setActiveMode"]),
    exploreClickHandler: function () {
      this.setActiveMode("explore");
    },
    expandClickHandler: function () {
      this.setActiveMode("expand");
    },
    collapseClickHandler: function () {
      this.setActiveMode("collapse");
    },
  },
};
</script>
<style scoped>
.click-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.selected {
  background: #2d9cdbaa;
}
</style>
