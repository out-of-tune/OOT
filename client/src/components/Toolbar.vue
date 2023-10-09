<template>
  <div id="toolbar">
    <MouseActionRadio></MouseActionRadio>
    <div class="action">
      <button id="undo-button" class="icon-btn tooltip" @click="undoAction">
        <v-icon class="icon" color="white" name="md-undo" />
        <span class="tooltiptext">UNDO</span>
      </button>
      <button id="redo-button" class="icon-btn tooltip" @click="redoAction">
        <v-icon class="icon" color="white" name="md-redo" />
        <span class="tooltiptext">REDO</span>
      </button>
    </div>
    <SelectionPopover></SelectionPopover>
    <div>
      <button
        id="playlists-button"
        class="icon-btn tooltip"
        @click="switchPlaylistLoader"
      >
        <v-icon class="icon" color="white" name="md-playlistplay" />
        <span class="tooltiptext">PLAYLISTS</span>
      </button>
    </div>

    <LoadSavePopover></LoadSavePopover>

    <router-link to="/settings" target="_blank" @click="trackSettings">
      <button class="icon-btn tooltip" id="settings-button">
        <v-icon class="icon" color="white" name="md-settings" />
        <span class="tooltiptext">SETTINGS</span>
      </button>
    </router-link>

    <router-link to="/help" target="_blank">
      <button id="help-button" class="icon-btn tooltip">
        <v-icon class="icon" color="white" name="md-helpoutline" />
        <span class="tooltiptext">HELP</span>
      </button>
    </router-link>
    <div>
      <button
        id="feedback-button"
        class="icon-btn tooltip"
        @click="openFeedbackModal"
      >
        <v-icon class="icon" color="white" name="md-feedback" />
        <span class="tooltiptext">FEEDBACK</span>
      </button>
    </div>
    <div>
      <button
        id="share-button"
        class="icon-btn tooltip"
        @click="openShareModal"
      >
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
    trackSettings() {},
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
<style>
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

.action {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}
</style>
