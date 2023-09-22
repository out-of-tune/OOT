<template>
  <Popper>
    <button class="container action tooltip">
      <v-icon class="icon" color="white" icon="mdi-select-all" />
      <span class="tooltiptext">SELECTION</span>
    </button>
    <template #content>
      <div class="text-xs-center popover">
        <div>
          <div class="menu">
            <h2 id="menu-header">Selection Actions</h2>

            <div>
              <div class="actions">
                <btn class="btn" @click="collapse">Collapse</btn>
                <btn class="btn" @click="expand">Expand</btn>

                <btn class="btn" @click="remove">Remove</btn>
                <btn dark class="btn" @click="pin(selectedNodes)">Pin</btn>
                <btn
                  dark
                  small
                  outline
                  class="btn"
                  @click="unpin(selectedNodes)"
                  >Unpin</btn
                >
                <btn class="btn" @click="invert">Invert</btn>
                <btn class="btn" @click="sortNodes">sort</btn>
                <btn class="btn" @click="addToQueue">Add to queue</btn>
                <btn class="btn" @click="openPlaylistChooser"
                  >Add to playlist</btn
                >
              </div>
              <btn class="btn-orange" @click="showItems">show items</btn>
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
  data: () => {},
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

.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}

.tooltip .tooltiptext {
  visibility: hidden;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  background-color: #0d676d;

  position: absolute;
  z-index: 1;
  top: -1px;
  right: 110%;
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
  align-self: flex-start;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.menu {
  padding: 1rem;
}
</style>
