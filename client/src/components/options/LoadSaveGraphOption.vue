<template>
    <div class="loadSave">
        <div class="storeActions">
            <div id="autocomplete">
                <v-autocomplete
                v-model="loadName"
                label="graphs"
                :items="graphNames"
                ></v-autocomplete>
            </div>
            <input id="loadInput" ref="loadInput" style="display: none" type="file" @change="previewFiles">
            <v-icon id="delete" @click="deleteGraph()" class="icon" color="black" icon="mdi-delete-outline"/>
            <v-btn id="load" class="actionButton" outline small @click="loadFromIndexedDb(loadName)">Load</v-btn>
        </div>
        <div>
            <v-text-field
            v-model="saveName"
            placeholder="graph name"
            ></v-text-field>
            <a id="download" ref="downloadButton" v-show="false"></a>
            <v-btn outline small v-on:click="saveGraph">Download</v-btn>
            <v-btn class="confirmButton" outline small @click="saveGraphToIndexedDb(saveName)">Save</v-btn>
        </div>
        <v-btn id="upload" class="actionButton" outline small @click="uploadFile">Load from file</v-btn>

    </div>
</template>
<script>
    import { mapActions, mapState } from 'vuex'
    export default {
        methods: {
            ...mapActions([
                'importGraph',
                'storeGraph',
                'loadGraphFromIndexedDb',
                'removeGraphFromIndexedDb',
                'downloadGraph'
            ]),
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
                            this.importGraph(result)
                        })
                }
            },
            generateFileName: function(){
                    return this.saveName+'_graph.json'
            },
            startDownloadOfUrl: function(downloadRef,url,downloadFileName){
                const link = downloadRef
                link.href = url
                link.setAttribute('download', downloadFileName)
                link.click()
                link.href=""
                URL.revokeObjectURL(url)
            },
            saveGraph: function(){
                this.downloadGraph()
                const name = this.generateFileName()
                this.startDownloadOfUrl(this.$refs.downloadButton, this.$store.state.graph_io.url, name)
            },
            deleteGraph: function(){
                if(this.loadName.length>0){
                    this.removeGraphFromIndexedDb(this.loadName)
                    this.loadName=""
                }
            },
            loadFromIndexedDb(loadName){
                this.loadGraphFromIndexedDb(loadName)
            },
            saveGraphToIndexedDb(saveName){
                this.storeGraph(saveName)
            },
            uploadFile(){
                this.$refs.loadInput.click()
            }
        },
        computed: {
            ...mapState({
                graphNames: state => state.graph_io.storedGraphNames,
            })
        },
        data: ()=>({
            loadName: "",
            saveName: "",
        })
    }
</script>
<style scoped>
    .loadSave{
        display:grid;
        grid-template-rows: 1fr 1fr;
        grid-gap: 0.5rem;
    }
   
    #load{
        grid-area: storage;
    }
    #delete{
        grid-area: delete;
        align-self: center;
        padding-left: 25%;
    }
    .confirmButton {
        float: right;
    }
    #autocomplete{
        grid-area: input;
    }
    #upload{
        margin: 0;
    }
    .storeActions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas: "input input input delete" 
                             ". . storage storage" 
    }
    .actionButton {
        margin: 0 !important;
    }
    .icon {
        margin: 0;
        padding: 0;
        width: 24px;
    }
</style>
