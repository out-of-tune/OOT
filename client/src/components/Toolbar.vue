<template>
  <div id="toolbar">
    <MouseActionRadio></MouseActionRadio>
    <div class="spacer"></div>

    <div class="action">
      <button class="container tooltip" @click="undoAction">
        <v-icon class="icon" color="white" icon="mdi-undo" />
        <span class="tooltiptext">UNDO</span>
      </button>
      <button class="container tooltip" @click="redoAction">
        <v-icon class="icon" color="white" icon="mdi-redo" />
        <span class="tooltiptext">REDO</span>
      </button>
    </div>
    <div class="spacer"></div>
    <SelectionPopover></SelectionPopover>
    <div>
      <button class="container tooltip action" @click="switchPlaylistLoader">
        <v-icon class="icon" color="white" icon="mdi-playlist-plus" />
        <span class="tooltiptext">PLAYLISTS</span>
      </button>
    </div>

    <LoadSavePopover></LoadSavePopover>

    <router-link
      :to="{ name: 'Settings' }"
      target="_blank"
      @click="trackSettings"
    >
      <button class="container action tooltip" v-on="on">
        <v-icon class="icon" color="white" icon="mdi-cog-outline" />
        <span class="tooltiptext">SETTINGS</span>
      </button>
    </router-link>

    <router-link :to="{ name: 'Help' }" target="_blank">
      <button class="container action tooltip" v-on="on">
        <v-icon class="icon" color="white" icon="mdi-help" />
        <span class="tooltiptext">HELP</span>
      </button>
    </router-link>
    <div>
      <button class="container tooltip action" @click="openFeedbackModal">
        <v-icon class="icon" color="white" icon="mdi-message-alert" />
        <span class="tooltiptext">FEEDBACK</span>
      </button>
    </div>
    <div>
      <button class="container tooltip action" @click="openShareModal">
        <v-icon class="icon" color="white" icon="mdi-share" />
        <span class="tooltiptext">SHARE</span>
      </button>
    </div>
  </div>
</template>
<script>
import MouseActionRadio from "@/components/helpers/MouseActionRadio.vue";
import LoadSavePopover from "@/components/popovers/LoadSavePopover";
import SelectionPopover from "@/components/popovers/SelectionActionPopover";
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
      "changeFeedbackModalState",
      "changeShareModalState",
    ]),
    switchPlaylistLoader: function () {
      this.changePlaylistLoaderState(true);
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
<style scoped>
#toolbar {
  padding-top: 64px;
  width: 30px;
  /* padding-left: 5px; */
  right: 0px;
  height: 100vh;
  z-index: 1;
  background-color: #302c29;
  /* border-left: 2px solid #da6a1d; */
  position: fixed;
  color: white;
  display: grid;
  grid-template-rows: 0.5fr 1fr 0.5fr 1fr 1fr 1fr 1fr 1fr 2fr;
  padding-bottom: 70px;
  align-items: flex-start;
  align-content: flex-start;
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

.action {
  /* margin-top: 4rem; */
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
