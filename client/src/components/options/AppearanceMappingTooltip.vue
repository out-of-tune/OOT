<template>
    <div>
        <div class="card" v-for="(nodeType, index) in nodeTypes" v-bind:key="index">
            <AppearanceMappingTooltipOption :index="index" :nodeType="nodeType"></AppearanceMappingTooltipOption>
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import AppearanceMappingTooltipOption from './AppearanceMappingTooltipOption'
export default {
    components: {
        AppearanceMappingTooltipOption
    },
    computed: {
        ...mapState({
            nodeTypes: state => state.schema.nodeTypes,
        })
    }
}
</script>
<style scoped>
.field {
    display: grid;
    grid-template-columns: 100px 150px;
}
.card {
    background-color:rgb(37, 37, 37);
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
    border-radius: 5px;
    margin-bottom: 1rem;
}
</style>

