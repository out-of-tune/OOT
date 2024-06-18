<template>
  <div class="loadSave">
    <div id="autocomplete">
      <!-- TODO: create autocomplete -->
      <input type="text" v-model="configName" label="configurations" />
      <ul>
        <li v-for="config in filteredConfigurationNames" :key="config" v-on:click="configName = config">
          {{ config }}
        </li>
      </ul>
    </div>
    <div class="actions">
      <input id="loadInput" ref="loadInput" type="file" @change="previewFiles" style="display: none" />
      <button id="load" class="btn" @click="loadConfigurationFromIndexedDb(configName)">
        Load
      </button>
      <button class="btn" id="upload" @click="uploadFile">Load from File</button>
    </div>

    <div class="actions">
      <a id="download" ref="downloadButton" v-show="false" @click="trackDownload"></a>
      <button class="btn" v-on:click="storeConfig(configName)">Save</button>
      <button class="btn" v-on:click="saveConfiguration">Download</button>
    </div>
    <div class="actions">
      <button class="icon-btn">
        <v-icon id="delete" @click="deleteConfiguration()" class="icon" name="md-delete"
          title="delete configuration from browser" />
      </button>
      <button class="btn" v-on:click="reimportConfiguration" title="reset current configuration to default">
        Reset
      </button>
    </div>
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
      return this.configName + "_config.json";
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
      if (this.configName.length > 0) {
        this.removeConfigurationFromIndexedDb(this.configName);
        this.configName = "";
      }
    },
    loadFromIndexedDb(configName) {
      this.loadConfigurationFromIndexedDb(configName);
    },
    trackDownload() { },
    storeConfig(configName) {
      this.storeConfiguration(configName);
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
    filteredConfigurationNames() {
      if (!this.configName) return this.configurationNames
      return this.configurationNames.filter(c => c.match(this.configName))
    }
  },
  data: () => ({
    configFile: "",
    configName: "",
  }),
};
</script>
<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.loadSave {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

#autocomplete {
  display: flex;
  flex-direction: column;
}
</style>
