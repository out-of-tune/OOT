<template>
  <div class="loadSave">
    <div class="storeActions">
      <div id="autocomplete">
        <!-- TODO: create autocomplete -->
        <input
          type="text"
          v-model="loadName"
          label="configurations"
          :items="configurationNames"
        />
      </div>
      <input
        id="loadInput"
        ref="loadInput"
        type="file"
        @change="previewFiles"
        style="display: none"
      />
      <button
        id="load"
        class="btn"
        @click="loadConfigurationFromIndexedDb(loadName)"
      >
        Load
      </button>
      <button class="btn" id="upload" @click="uploadFile">Select File</button>
      <button class="icon-btn">
        <v-icon
          id="delete"
          @click="deleteConfiguration()"
          class="icon"
          name="md-delete"
          title="delete configuration from browser"
        />
      </button>
    </div>
    <input type="text" v-model="saveName" placeholder="configuration name" />
    <a
      id="download"
      ref="downloadButton"
      v-show="false"
      @click="trackDownload"
    ></a>
    <button class="btn" v-on:click="storeConfig(saveName)">Save</button>
    <button class="btn" v-on:click="saveConfiguration">Download</button>
    <button
      class="btn"
      v-on:click="reimportConfiguration"
      title="reset current configuration to default"
    >
      Reset Configuration
    </button>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
  methods: {
    ...mapActions([
      "importConfiguration",
      "initConfiguration",
      "setInfo",
      "applyAllConfigurations",
      "downloadConfiguration",
      "storeConfiguration",
      "loadConfigurationFromIndexedDb",
      "removeConfigurationFromIndexedDb",
    ]),
    reimportConfiguration: function () {
      this.setInfo("Configuration Reset");
      this.initConfiguration();
      this.applyAllConfigurations();
    },
    previewFiles: function (event) {
      var files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      if (files[0] != "") {
        fetch(URL.createObjectURL(files[0]))
          .then((response) => {
            return response.text();
          })
          .then((result) => {
            this.importConfiguration(result);
          });
      }
    },
    generateConfigurationFileName: function () {
      return this.saveName + "_config.json";
    },
    startDownloadOfUrl: function (downloadRef, url, downloadFileName) {
      const link = downloadRef;
      link.href = url;
      link.setAttribute("download", downloadFileName);
      link.click();
      URL.revokeObjectURL(url);
    },
    saveConfiguration: function () {
      this.downloadConfiguration();
      const name = this.generateConfigurationFileName();
      this.startDownloadOfUrl(
        this.$refs.downloadButton,
        this.$store.state.configuration_io.url,
        name,
      );
    },
    deleteConfiguration: function () {
      if (this.loadName.length > 0) {
        this.removeConfigurationFromIndexedDb(this.loadName);
        this.loadName = "";
      }
    },
    loadFromIndexedDb(loadName) {
      this.loadConfigurationFromIndexedDb(loadName);
    },
    trackDownload() {},
    storeConfig(saveName) {
      this.storeConfiguration(saveName);
    },
    uploadFile() {
      this.$refs.loadInput.click();
    },
  },
  computed: {
    ...mapState({
      configuration: (state) => state.configurations,
      configurationNames: (state) =>
        state.configuration_io.storedConfigurationNames,
    }),
  },
  data: () => ({
    configFile: "",
    loadName: "",
    saveName: "",
  }),
};
</script>
<style scoped>
.storeActions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.loadSave {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
</style>
