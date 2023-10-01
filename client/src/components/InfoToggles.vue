<template>
  <div class="info">
    <button
      class="toggle icon-btn"
      :class="{ activated: nodeInfoDisplay }"
      @click="setNodeInfoVisibility(!nodeInfoDisplay)"
    >
      <v-icon name="md-infooutline" />
    </button>
    <button
      class="toggle icon-btn"
      :class="{ activated: queueDisplay }"
      @click="setQueueVisibility(!queueDisplay)"
    >
      <v-icon name="md-queuemusic" />
    </button>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["setQueueVisibility", "setNodeInfoVisibility"]),
  },
  computed: {
    ...mapState({
      nodeInfoDisplay: (state) => state.visibleItems.nodeInfo,
      queueDisplay: (state) => state.visibleItems.queueDisplay,
    }),
  },
};
</script>

<style scoped>
.info {
  background-color: #252525;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  width: fit-content;
}
.toggle {
  background-color: #da6a1d;
  color: white;
}
.toggle:hover {
  background-color: #1dcdda66;
}
.toggle.activated:hover {
  background-color: #1dcdda66;
}
.toggle.activated {
  background-color: #1dcddaff;
}
#queueButton.activated {
  background-color: #1dcddaff;
}
</style>
