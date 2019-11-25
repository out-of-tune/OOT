<template>
    <div>
        <div class="field">
            <div>{{nodeType.label}}</div>
            <select
                id="attributes"
                v-model="currentTooltip"
            >
                <option v-for="attribute in nodeType.attributes" 
                    v-bind:key="attribute.key" :value="attribute">{{attribute}}</option>
            </select>           
        </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
    props: [
        'index',
        'nodeType'
    ],
    computed: {
        ...mapState({
            nodeConfiguration: state => state.configurations.appearanceConfiguration.nodeConfiguration
        }),
        tooltipRules: {
            get() {
                return this.nodeConfiguration.tooltip
            },
            set() {
                this.updateTooltipRules({rules: this.tooltipRules})
            }
        },
        currentTooltip: {
            get() {
                if(this.tooltipRules[this.index]){
                    const tooltip = this.tooltipRules[this.index].attribute
                    return tooltip
                }
                else {
                    return "_id"
                }
            },
            set: function(newValue) {
                this.setRule(newValue)
            }
        }
    },
    methods: {
        ...mapActions([
            'updateTooltipRules'
        ]),
        setRule: function(attribute){
            const tooltipRule = {nodeLabel: this.nodeType.label, attribute: attribute}
            this.tooltipRules[this.index] = tooltipRule
            this.updateTooltipRules({rules: this.tooltipRules})

        }
    }
}
</script>
<style scoped>
.field {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0.5rem;

}
.color {
    text-align: right;
}
select {
    height: 100%;
    background-color: white;
    color: black;
}
</style>

