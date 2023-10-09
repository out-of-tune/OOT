<template>
  <form action="" id="MouseActionRadio">
    <button class="icon-btn clickthrough tooltip">
      <label id="expand-button" for="expand">
        <input
          type="radio"
          id="expand"
          v-model="activeMode"
          value="expand"
          v-on:change="setActiveMode(activeMode)"
        />
        <v-icon class="icon" color="white" name="md-add" />
        <span class="tooltiptext">EXPAND</span>
      </label>
    </button>
    <button class="icon-btn clickthrough tooltip">
      <label id="collapse-button" for="collapse">
        <input
          type="radio"
          id="collapse"
          v-model="activeMode"
          value="collapse"
          v-on:change="setActiveMode(activeMode)"
        />
        <v-icon class="icon" color="white" name="md-remove" />
        <span class="tooltiptext">COLLAPSE</span>
      </label>
    </button>
    <button class="icon-btn clickthrough tooltip">
      <label id="explore-button" for="explore">
        <input
          type="radio"
          id="explore"
          v-model="activeMode"
          value="explore"
          v-on:change="setActiveMode(activeMode)"
        />
        <v-icon class="icon" color="white" name="md-musicnote" />
        <span class="tooltiptext">EXPLORE</span>
      </label>
    </button>
  </form>
</template>
<script>
import { mapActions } from "vuex";
export default {
  data: () => {
    return {
      activeMode: "expand",
    };
  },
  methods: {
    ...mapActions(["setActiveMode"]),
  },
};
</script>
<style scoped>
#MouseActionRadio {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
}

[type="radio"]:checked + .icon {
  background: #2d9cdb;
}

[type="radio"]:hover + .icon {
  background: linear-gradient(180deg, #2d9cdb 0%, #56ccf2 100%);
}

.clickthrough {
  pointer-events: none;
}

.clickthrough label {
  pointer-events: auto;
  cursor: pointer;
}
</style>
