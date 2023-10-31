<template>
  <div>
    <div v-if="open" id="shareModal" class="modal">
      <div class="card">
        <v-icon @click="changeShareModalState" class="close" name="md-close" />
        <div class="content">
          <button class="right" @click="generateShareLink('graph')">
            share graph
          </button>
          <button class="left" @click="generateShareLink('settings')">
            share configuration
          </button>
          <input
            class="right shareLink"
            type="text"
            readonly
            ref="shareLink"
            :value="shareLink"
          />
          <button class="left" @click="copy">copy to clipboard</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data: () => ({}),
  computed: {
    ...mapState({
      open: (state) => state.share.shareModalOpen,
      shareLink: (state) => state.share.shareLink,
    }),
  },
  methods: {
    ...mapActions(["changeShareModalState", "generateShareLink", "setInfo"]),
    copy() {
      const copyText = this.$refs.shareLink;
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand("copy");
      this.setInfo("copied link");
    },
  },
};
</script>
<style scoped>
/* The Modal (background) */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 100; /* Sit on top */
  padding-top: 10%; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto;
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.card {
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;
  justify-self: center;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  overflow-y: auto;
}
.close {
  grid-area: actions;
  position: sticky;
  top: 0;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  cursor: pointer;
  float: right;
  border-radius: 2px 0 0 0;
  box-shadow: -1px -1px -13px -6px rgba(0, 0, 0, 1);
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 1rem;
}

.button {
  max-width: 200px;
}

.right {
  justify-self: right;
}

.left {
  justify-self: left;
}
</style>
