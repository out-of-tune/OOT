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
      <label class="plus-one" :class="{ hidden: !addToQueueNotification }"
        >+1</label
      >
      <v-icon name="md-queuemusic" />
    </button>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
  methods: {
    ...mapActions([
      "setQueueVisibility",
      "setNodeInfoVisibility",
      "setAddToQueueNotifaction",
    ]),
  },
  computed: {
    ...mapState({
      nodeInfoDisplay: (state) => state.visibleItems.nodeInfo,
      queueDisplay: (state) => state.visibleItems.queueDisplay,
      addToQueueNotification: (state) =>
        state.visibleItems.addToQueueNotification,
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
  height: fit-content;
  gap: 0.5rem;
  width: fit-content;
  display: flex;
  align-items: center;
}
.toggle.activated:hover {
  background-color: #2d9cdb;
}
.toggle.activated {
  background-color: #2d9cdb;
}
.plus-one {
  background-color: #2d9cdb;
  padding: 0.2rem;
  position: absolute;
  top: -1rem;
  border-radius: 4px;
}
.hidden {
  visibility: hidden;
}
</style>
