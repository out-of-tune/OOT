<template>
  <div class="loadSave">
    <div class="storeActions">
      <div id="autocomplete">
        <!-- TODO: create autocomplete -->
        <input
          type="text"
          v-model="loadName"
          label="graphs"
          :items="graphNames"
        />
      </div>
      <input
        id="loadInput"
        ref="loadInput"
        style="display: none"
        type="file"
        @change="previewFiles"
      />
      <button id="load" class="btn" @click="loadFromIndexedDb(loadName)">
        Load
      </button>
      <button class="btn" @click="uploadFile">Load from file</button>
      <button class="icon-btn">
        <v-icon
          id="delete"
          @click="deleteGraph()"
          class="icon"
          name="md-delete"
        />
      </button>
    </div>
    <input type="text" v-model="saveName" placeholder="graph name" />
    <a id="download" ref="downloadButton" v-show="false"></a>
    <button class="btn" v-on:click="saveGraph">Download</button>
    <button class="btn" @click="saveGraphToIndexedDb(saveName)">Save</button>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
  methods: {
    ...mapActions([
      "importGraph",
      "storeGraph",
      "loadGraphFromIndexedDb",
      "removeGraphFromIndexedDb",
      "downloadGraph",
    ]),
    previewFiles: function (event) {
      var files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      if (files[0] != "") {
        fetch(URL.createObjectURL(files[0]))
          .then((response) => {
            return response.text();
          })
          .then((result) => {
            this.importGraph(result);
          });
      }
    },
    generateFileName: function () {
      return this.saveName + "_graph.json";
    },
    startDownloadOfUrl: function (downloadRef, url, downloadFileName) {
      const link = downloadRef;
      link.href = url;
      link.setAttribute("download", downloadFileName);
      link.click();
      link.href = "";
      URL.revokeObjectURL(url);
    },
    saveGraph: function () {
      this.downloadGraph();
      const name = this.generateFileName();
      this.startDownloadOfUrl(
        this.$refs.downloadButton,
        this.$store.state.graph_io.url,
        name,
      );
    },
    deleteGraph: function () {
      if (this.loadName.length > 0) {
        this.removeGraphFromIndexedDb(this.loadName);
        this.loadName = "";
      }
    },
    loadFromIndexedDb(loadName) {
      this.loadGraphFromIndexedDb(loadName);
    },
    saveGraphToIndexedDb(saveName) {
      this.storeGraph(saveName);
    },
    uploadFile() {
      this.$refs.loadInput.click();
    },
  },
  computed: {
    ...mapState({
      graphNames: (state) => state.graph_io.storedGraphNames,
    }),
  },
  data: () => ({
    loadName: "",
    saveName: "",
  }),
};
</script>

<style scoped>
.storeActions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.loadSave {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  align-items: center;
}
</style>
