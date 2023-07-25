<template>
    <form action="" id="MouseActionRadio">     
        <label class="container tooltip" for="expand">
            <input type="radio" id="expand" v-model="activeMode" value="expand" v-on:change="setActiveMode(activeMode)">
            <v-icon class="icon" color="white" icon="mdi-circle-expand"/>
            <span class="tooltiptext">EXPAND</span>
        </label>
        <label class="container tooltip" for="collapse">
            <input type="radio" id="collapse" v-model="activeMode" value="collapse" v-on:change="setActiveMode(activeMode)">
            <v-icon class="icon" color="white" icon="mdi-minus-circle-outline"/>
            <span class="tooltiptext">COLLAPSE</span>
        </label>
        <label class="container tooltip" for="explore">
            <input type="radio" id="explore" v-model="activeMode" value="explore" v-on:change="setActiveMode(activeMode)">
            <v-icon class="icon" color="white" icon="mdi-music-note"/>
            <span class="tooltiptext">EXPLORE</span>
        </label>
    </form>
</template>
<script>
import { mapActions } from 'vuex';
export default {
    data: ()=>{
        return {
            activeMode: "expand"
        }
    },
    methods: {
        ...mapActions([
            'setActiveMode'
        ])
    }
}
</script>
<style scoped>
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

    #MouseActionRadio {
        display: inline;
        /* grid-template-columns: 1fr; */
        /* margin-top: 1rem; */
    }

    [type=radio] { 
        position: absolute;
        top: 7px;
        opacity: 0;
        width: 0;
        height: 0;
        padding: 0;
        margin: 0;
    }

    .container {
        padding: 0;
        height: 30px;
    }

    [type=radio]:checked + .icon {
        background-color: #1dcddaff;
    }

    [type=radio]:hover + .icon {
        background-color: #1dcdda66;
    }

    [type=radio] + .icon {
        background-color: #da6a1dff;
        padding: 3px;
        cursor: pointer;
    }
</style>

