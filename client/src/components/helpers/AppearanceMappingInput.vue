<template>
    <div id="input">
        <div id="autocompleteBox" @keydown="selectEvent" @focusout="changeVisibility">
        <v-text-field
            autocomplete="off"
            dark
            color="white"
            type="text"
            @focus="inputIsFocused=true"
            v-bind:class="{validString: searchObject.valid, invalidString: !searchObject.valid}"
            ref="searchInput"
            name="searchField"
            id="searchField"
            label="add Rule"
            v-model="localSearchString"
        ></v-text-field>
        <ul ref="autocomplete" id="autocomplete" v-if="getMatchingData().length>0 && inputIsFocused">
            <li
                v-for="(data) in getMatchingData()"
                @mousedown="addOnClick(data)"
                v-bind:key="data"
            >{{data}}</li>
        </ul>
        </div>
    </div>
</template>
<script>
import { generateSearchObject } from "@/assets/js/searchObjectHelper"
import { mapState, mapGetters } from "vuex"
export default {
    props: ['searchObject', 'searchString'],
    data: ()=>({
        autocompleteClicked: false,
        inputIsFocused: false,
        selectedItem: -1,
        localSearchString: ""
    }),
    computed: {
        ...mapState({
            schemaNodeTypes: state => state.schema.nodeTypes
        }),
        tip: function(){
            return this.searchObject.tip
        }
    },
    watch: {
        localSearchString: {
            handler(newLocalSearchString){
                this.$emit('update:searchString', newLocalSearchString)
                this.addCharacterInput(newLocalSearchString)
            }
        }
    },
    methods: {
        ...mapGetters(["getNodeLabelNames"]),
        getMatchedTypes: function(types, text){
            return types.filter((type)=> type.toLowerCase().includes(text.toLowerCase()))
        },
        getAttributes: function(nodeType){
            return this.schemaNodeTypes.filter((schemaNodeType)=>nodeType===schemaNodeType.label)[0]["attributes"]
        },
        getMatchingData: function(){
            if(this.tip){
                const typesToMatch = this.getAttributes(this.tip.nodeType)
                const matching = this.getMatchedTypes(typesToMatch, this.tip.text.trim())
                if(matching.length==1&& matching[0]===this.tip.text){
                    return []
                }
                return matching
            }
            return []
        },
        addNeededQuotes(attributePart){
            return attributePart.includes(" ") && attributePart[0]!=="\"" && attributePart[attributePart.length-1]!=="\""
            ?"\""+attributePart+"\""
            :attributePart
        },
        changeVisibility: function(){
            if(this.autocompleteClicked){
                this.autocompleteClicked=false
                this.$refs.searchInput.focus()
            }
            else{
                this.inputIsFocused=false
            }
        },
        useSelected: function(){
            if(this.$refs.autocomplete && this.selectedItem!=-1){
                this.addOnClick(this.$refs.autocomplete.childNodes[this.selectedItem].innerText)
            }else{
                this.$emit('addRule')
            }
        },
        selectEvent: function(event){
            switch(event.keyCode){
                case 38:
                    this.moveToPrevious()
                break
                case 40:
                    this.moveToNext()
                break
                case 13:
                    this.useSelected()
                break
            }
        },
        addOnClick: function(clickedTooltip){
            if(this.tip!=undefined){
                if(this.tip.type==="attribute"){
                    const stringifiedAttributes = this.searchObject.attributes
                    .filter((attribute,index)=>{
                        if(index==this.searchObject.attributes.length-1){
                            return attribute.attributeSearch && attribute.attributeData && attribute.operator
                        }
                        return true
                    })
                    .map((attribute)=>{
                        const searchPart = this.addNeededQuotes(attribute.attributeSearch)
                        const dataPart = this.addNeededQuotes(attribute.attributeData)
                        return searchPart + attribute.operator + dataPart
                    })
                    const stringifiedTooltip = this.addNeededQuotes(clickedTooltip) +"="
                    const stringifiedQuery = this.searchObject.nodeType+": "+[...stringifiedAttributes, stringifiedTooltip].join(" ")
                    this.localSearchString = [...stringifiedAttributes, stringifiedTooltip].join(" ")
                    this.$emit('update:searchObject', generateSearchObject(stringifiedQuery))
                }
            }
            this.autocompleteClicked=true
        },
        moveToNext: function(){
            if(this.$refs.autocomplete){
                if(this.selectedItem+1<this.$refs.autocomplete.childNodes.length){
                    if(this.selectedItem!=-1){
                        this.$refs.autocomplete.childNodes[this.selectedItem].className=""
                    }
                    this.selectedItem++
                    this.$refs.autocomplete.childNodes[this.selectedItem].className="selected"
                    this.$refs.autocomplete.childNodes[this.selectedItem].scrollIntoView(false)

                } 
            }
        },
        moveToPrevious: function(){
            if(this.$refs.autocomplete){
                if(this.selectedItem!=-1){
                    this.$refs.autocomplete.childNodes[this.selectedItem].className=""
                    this.selectedItem--
                    if(this.selectedItem!=-1){
                        this.$refs.autocomplete.childNodes[this.selectedItem].className="selected"
                        this.$refs.autocomplete.childNodes[this.selectedItem].scrollIntoView(false)
                    }
                } 
            }
        },
        addCharacterInput: function(searchString){
            this.selectedItem= -1
            if(this.$refs.autocomplete){
                this.$refs.autocomplete.childNodes.forEach((listItem)=>{
                    listItem.className=""
                })
            }
            this.$emit('update:searchObject', generateSearchObject(this.searchObject.nodeType + ": " + searchString))
        }
    },
    created: function(){
        this.localSearchString = this.searchString
    }
}
</script>
<style scoped>
    li{
        padding: 1rem;
    }
    li:hover{
        background-color: #f0f0f0;
    }
    ul{
        padding: 0;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
    #autocomplete {
        list-style: none;
        text-align: left;
        cursor: pointer;
        background-color: white;
        color: black;
        max-height: 30vh;
        overflow-y:scroll;
        position: absolute;
        border: none;
        z-index: 1;
    }
    .validString{
        color: green !important;
    }
    .invalidString{
        color: red !important ;
    }
    .selected{
        color: #da6a1d;
    }
    #searchField {
        color: white !important;
        display: flex;
        align-self: center;
        justify-self: center;
        margin: 0 !important;
    }
</style>
