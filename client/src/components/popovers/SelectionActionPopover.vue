<template>
  <Popper>
    <button id="selection-button" class="icon-btn tooltip">
      <v-icon class="icon" color="white" name="md-selectall" />
      <span class="tooltiptext">SELECTION</span>
    </button>
    <template #content>
      <div class="text-xs-center popover">
        <div>
          <div class="menu">
            <h2 id="menu-header">Selection Actions</h2>

            <div>
              <div class="actions">
                <button class="btn" @click="collapse">Collapse</button>
                <button class="btn" @click="expand">Expand</button>

                <button class="btn" @click="remove">Remove</button>
                <button class="btn" @click="pin(selectedNodes)">Pin</button>
                <button class="btn" @click="unpin(selectedNodes)">Unpin</button>
                <button class="btn" @click="invert">Invert</button>
                <button class="btn" @click="sortNodes">sort</button>
                <button class="btn" @click="addToQueue">Add to queue</button>
                <button class="btn" @click="addSelectedSongsToPlaylist">
                  Add to playlist
                </button>
              </div>
              <button class="btn btn-orange" @click="showItems">
                show items
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popper>
</template>
<script>
import { mapActions, mapState } from "vuex";
import { getNodePosition } from "@/assets/js/graphHelper";

import { defineComponent } from "vue";
import Popper from "vue3-popper";

export default defineComponent({
  components: {
    Popper,
  },
  methods: {
    ...mapActions([
      "changeSelectionModalState",
      "changePlaylistChooserState",
      "expandSelectedNodes",
      "collapseSelectedNodes",
      "removeSelectedNodes",
      "addSelectedSongsToQueue",
      "pinNodes",
      "unpinNodes",
      "invertSelection",
      "applyNodeCoordinateSystemLine",
      "addSelectedSongsToPlaylist",
    ]),
    collapse() {
      this.collapseSelectedNodes();
    },
    expand() {
      this.expandSelectedNodes();
    },
    remove() {
      this.removeSelectedNodes();
    },
    openPlaylistChooser() {
      this.changePlaylistChooserState(true);
    },
    pin(selectedNodes) {
      this.pinNodes(selectedNodes);
    },
    unpin(selectedNodes) {
      this.unpinNodes(selectedNodes);
    },
    invert() {
      this.invertSelection();
    },
    sortNodes() {
      const pos = getNodePosition(this.$store.state, this.selectedNodes[0]);
      this.applyNodeCoordinateSystemLine({ xOffset: pos.x, yOffset: pos.y });
    },
    addToQueue() {
      this.addSelectedSongsToQueue();
    },
    addToPlaylist() {
      this.addSelectedSongsToPlaylist();
    },
    showItems() {
      this.changeSelectionModalState();
    },
    toggleMenu() {
      this.menu = !this.menu;
    },
  },
  computed: {
    ...mapState({
      selectedNodes: (state) => state.selection.selectedNodes,
    }),
  },
});
</script>
<style scoped>
.popover {
  background-color: #252525;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.menu {
  padding: 1rem;
}
</style>
