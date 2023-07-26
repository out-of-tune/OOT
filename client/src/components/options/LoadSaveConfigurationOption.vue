<template>
    <div class="loadSave">
        <div class="storeActions">
            <div id="autocomplete">
                <v-autocomplete
                v-model="loadName"
                label="configurations"
                :items="configurationNames"
                ></v-autocomplete>
            </div>
            <input id="loadInput" ref="loadInput" type="file" @change="previewFiles" style="display: none">
            <v-icon id="delete" @click="deleteConfiguration()" class="icon" color="black" icon="mdi-delete-outline"/>
            <v-btn id="load" class="actionButton" outline small @click="loadConfigurationFromIndexedDb(loadName)">Load</v-btn>
        </div>
        <div>
            <v-text-field
            v-model="saveName"
            placeholder="configuration name"
            ></v-text-field>
            <a id="download" ref="downloadButton" v-show="false" @click="trackDownload"></a>
            <v-btn outline small v-on:click="saveConfiguration">Download</v-btn>
            <v-btn class="confirmButton" outline small v-on:click="storeConfig(saveName)">Save</v-btn>
        </div>
        <v-btn id="reset" outline small v-on:click="reimportConfiguration">Reset Configuration</v-btn>
        <v-btn id="upload" outline small @click="uploadFile">Load from file</v-btn>
    </div>
</template>
<script>
    import { mapActions, mapState } from 'vuex'
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
                "removeConfigurationFromIndexedDb"
            ]),
            reimportConfiguration :function(){
                this.setInfo("Configuration Reset")
                this.initConfiguration()
                this.applyAllConfigurations()
            },
            previewFiles: function(event) {
                var files = event.target.files || event.dataTransfer.files;
                if (!files.length)
                    return;
                if(files[0]!=""){
                    fetch(URL.createObjectURL(files[0]))
                        .then((response)=>{
                            return response.text()
                        })
                        .then((result)=>{
                            this.importConfiguration(result)
                        })
                }
            },
            generateConfigurationFileName: function(){
                return this.saveName+'_config.json'
            },
            startDownloadOfUrl: function(downloadRef,url,downloadFileName){
                const link = downloadRef
                link.href = url
                link.setAttribute('download', downloadFileName)
                link.click()
                URL.revokeObjectURL(url)

            },
            saveConfiguration: function(){ 
                this.downloadConfiguration()            
                const name = this.generateConfigurationFileName()
                this.startDownloadOfUrl(this.$refs.downloadButton, this.$store.state.configuration_io.url, name)
            },
            deleteConfiguration: function(){
                if(this.loadName.length>0){
                    this.removeConfigurationFromIndexedDb(this.loadName)
                    this.loadName=""
                }
            },
            loadFromIndexedDb(loadName){
                this.loadConfigurationFromIndexedDb(loadName)
            },
            trackDownload(){
            },
            storeConfig(saveName){
                this.storeConfiguration(saveName)
            },
            uploadFile(){
                this.$refs.loadInput.click()
            }
        },
        computed: {
            ...mapState({
                configuration: state => state.configurations,
                configurationNames: state => state.configuration_io.storedConfigurationNames
            })
        },
        data: ()=>({
            configFile : "",
            loadName: "",
            saveName: ""
        })
    }
</script>
<style scoped>
    .loadSave{
        display:grid;
        grid-template-rows: 1fr 1fr 2rem;
        grid-gap: 0.5rem;
    }
    .confirmButton {
        float: right;
    }
    #load{
        grid-area: storage;
    }
    #delete{
        grid-area: delete;
        align-self: center;
        padding-left: 25%;
    }
    #autocomplete{
        grid-area: input;
    }
    #upload{
        margin: 0;
    }
    .storeActions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 30px;
        grid-template-areas: "input input input delete" 
                             ". . storage storage" 
    }
    .actionButton {
        margin: 0 !important;
    }
</style>
