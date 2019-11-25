<template>
    <div>
        <h1>{{nodeLabel}}</h1>
        <h2>expand/collapse</h2>
        <GraphModificationOption id="expand-collapse" :nodeLabel="nodeLabel"></GraphModificationOption>
        <h2 id="layout">layout</h2>
        <LayoutOption :nodeType="nodeType"></LayoutOption>
    </div>
</template>
<script>
import {mapState} from 'vuex'
import LayoutOption from '@/components/options/LayoutOption'
import GraphModificationOption from "@/components/options/GraphModificationOption"
export default {
    components: {
        LayoutOption,
        GraphModificationOption
    },
    computed: {
        ...mapState({
            nodeLabel: state => state.mainGraph.currentNode.data.label,
            nodeTypes: state => state.schema.nodeTypes
        }),
        nodeType: function(){
            return this.nodeTypes.filter(nodeType => nodeType.label === this.nodeLabel)[0]
        }
    }
}
</script>
<style scoped>
    #expand-collapse {
        color: black;
    }
</style>
