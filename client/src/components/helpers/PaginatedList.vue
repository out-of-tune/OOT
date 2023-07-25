<template>
    <div class="paginationWrapper">
        <ul class="paginatedData">
            <li v-for="p in paginatedData" :style="{background: colorPath? getObjectColor(p): '#ffffff00', ...itemStyle}" :key="p.id" @click="itemClick(p)">
                <div class="columnOne" :style="columnOneStyle">
                    <span v-if="columnOnePath">{{objectData(p, columnOnePath)}} </span>
                </div>
                <div class="columnTwo" :style="columnTwoStyle">
                    <span v-if="columnTwoPath">{{objectData(p, columnTwoPath)}} </span>
                </div>
                <div class="columnThree" :style="columnThreeStyle">
                    <span v-if="columnThreePath">{{objectData(p, columnThreePath)}}</span>
                </div>
            </li>
        </ul>

        <v-pagination
            v-model="pageNumber"
            :length="pageCount"
            :total-visible="7"
            class="navigator"
        ></v-pagination>
    </div>
</template>
<script lang="js">
export default {
    data(){
        return {
            pageNumber: 1
        }
    },
    props:{
        listData:{
            type:Array,
            required:true
        },
        columnOnePath: {
            type:String,
            required:false
        },
        columnTwoPath: {
            type:String,
            required:false
        },
        columnThreePath: {
            type:String,
            required:false
        },
        itemStyle: {
            type:Object,
            required:false
        },
        columnOneStyle: {
            type:Object,
            required:false
        },
        columnTwoStyle: {
            type:Object,
            required:false
        },
        columnThreeStyle: {
            type:Object,
            required:false
        },
        colorPath: {
            type: String,
            required: false,
        },
        size:{
            type:Number,
            required:false,
            default: 10
        },
        itemClick: {
            default: ()=>{}
        }
    },
    methods:{
        nextPage(){
            this.pageNumber++;
        },
        prevPage(){
            this.pageNumber--;
        },
        objectData(obj, path){
            const attributes = path
                .split(".")
            const data = attributes.length>1
                ? attributes.slice(1)
                    .reduce((prev, curr)=>{
                        return prev[curr]
                    }, obj)
                : obj
            return data
        },
        getObjectColor(obj){
            return this.objectData(obj, this.colorPath).substring(0,7)+"77"
        }
    },
    computed:{
        pageCount(){
        let l = this.listData.length,
            s = this.size;
        return Math.ceil(l/s);
        },
        paginatedData(){
        const start = (this.pageNumber-1) * this.size,
                end = start + this.size;
        return this.listData
                .slice(start, end);
        }
    }
}
</script>
<style scoped>

    .paginationWrapper{
        display: grid;

        grid-template: "content" 1fr
                        "navigator" 3rem/auto
    }
    #navigator{
        grid-area: navigator;      
    }
    .paginatedData{
        grid-area: content;
        height: 25rem;
        overflow: auto;
    }
    ul{
        list-style-type: none;
    }
    li{
        display: grid;
        grid-template: "columnOne columnTwo columnThree" /1fr 1fr 1fr
    }
    .columnOne{
        grid-area: "columnOne"
    }
    .columnTwo{
        grid-area: "columnTwo"
    }
    .columnThree{
        grid-area: "columnThree"
    }
    li:hover {
        cursor: pointer; 
    }
    li:active {
        background-color: #0d676d;
    }
</style>
