<template>
  <div id="toolbar">
    <MouseActionRadio></MouseActionRadio>
    <div class="action">
      <button id="undo-button" class="container tooltip" @click="undoAction">
        <v-icon class="icon" color="white" name="md-undo" />
        <span class="tooltiptext">UNDO</span>
      </button>
      <button id="redo-button" class="container tooltip" @click="redoAction">
        <v-icon class="icon" color="white" name="md-redo" />
        <span class="tooltiptext">REDO</span>
      </button>
    </div>
    <SelectionPopover></SelectionPopover>
    <div>
      <button id="playlists-button" class="container tooltip action" @click="switchPlaylistLoader">
        <v-icon class="icon" color="white" name="md-playlistplay" />
        <span class="tooltiptext">PLAYLISTS</span>
      </button>
    </div>

    <LoadSavePopover></LoadSavePopover>

    <router-link to="/settings" target="_blank" @click="trackSettings">
      <button class="container action tooltip" id="settings-button">
        <v-icon class="icon" color="white" name="md-settings" />
        <span class=" tooltiptext">SETTINGS</span>
      </button>
    </router-link>

    <router-link to="/help" target="_blank">
      <button id="help-button" class="container action tooltip">
        <v-icon class="icon" color="white" name="md-helpoutline" />
        <span class="tooltiptext">HELP</span>
      </button>
    </router-link>
    <div>
      <button id="feedback-button" class="container tooltip action" @click="openFeedbackModal">
        <v-icon class="icon" color="white" name="md-feedback" />
        <span class="tooltiptext">FEEDBACK</span>
      </button>
    </div>
    <div>
      <button id="share-button" class="container tooltip action" @click="openShareModal">
        <v-icon class="icon" color="white" name="md-share" />
        <span class="tooltiptext">SHARE</span>
      </button>
    </div>
  </div>
</template>
<script>
import MouseActionRadio from "@/components/helpers/MouseActionRadio.vue";
import LoadSavePopover from "@/components/popovers/LoadSavePopover.vue";
import SelectionPopover from "@/components/popovers/SelectionActionPopover.vue";
import { mapActions, mapState } from "vuex";

export default {
  components: {
    MouseActionRadio,
    LoadSavePopover,
    SelectionPopover,
  },
  methods: {
    ...mapActions([
      "expandSelectedNodes",
      "collapseSelectedNodes",
      "removeSelectedNodes",
      "undo",
      "redo",
      "changePlaylistLoaderState",
      "changePlaylistChooserState",
      "changeFeedbackModalState",
      "changeShareModalState",
    ]),
    switchPlaylistLoader: function () {
      this.changePlaylistLoaderState(true);
      //this.changePlaylistChooserState(true);
    },
    trackSettings() { },
    undoAction() {
      this.undo();
    },
    redoAction() {
      this.redo();
    },
    openFeedbackModal() {
      this.changeFeedbackModalState();
    },
    openShareModal() {
      this.changeShareModalState();
    },
  },
  data: () => ({
    on: undefined,
    fav: true,
    menu: false,
    message: false,
    hints: true,
  }),
};
</script>
<style scoped>
#toolbar {
  margin-top: 10%;
  margin-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 30px;
  right: 0px;
  z-index: 1;
  background-color: #302c29;
  position: fixed;
  color: white;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  border-radius: 5px;
}

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

.menu {
  padding: 1rem;
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
  background: #ffffff;
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

.actions {
  display: flex;
  flex-direction: row;
}

.spacer {
  background-color: #ffffff66;
  height: 1px;
  width: 70%;
  margin-left: 15%;
  align-self: center;
}
</style>
