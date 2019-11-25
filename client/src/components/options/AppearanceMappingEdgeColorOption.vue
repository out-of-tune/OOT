<template>
    <div>
        <div class="field">
            <div>{{edgeType.label}}</div>
            <div class="color"><input id="color" type="color" v-model="currentColor"></div>
        </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
    props: [
        'index',
        'edgeType'
    ],
    data: ()=>({
        color: "ffffff"    
    }),
    computed: {
        ...mapState({
            edgeTypes: state => state.schema.edgeTypes,
            edgeConfiguration: state => state.configurations.appearanceConfiguration.edgeConfiguration
        }),
        edgeRules: {
            get() {
                return this.edgeConfiguration.color
            },
            set() {
            }
        },
        currentColor: {
            get() {
                if(this.edgeRules[this.index]){
                    const color = this.edgeRules[this.index].color
                    return this.formatDisplayColor(color)
                }
                else {
                    return "#0000ff"
                }
            },
            set: function(newValue) {
                this.color = newValue
                this.setRules(newValue)
            }
        }
    },
    methods: {
        ...mapActions([
            'updateEdgeRules'
        ]),
        formatRuleColor: function(color){
            return color.substring(1) + "ff"
        },
        formatDisplayColor: function(color){
            return "#" + color.substring(0,6)
        },
        setRules: function(){
            const edgeRule = {edgeLabel: this.edgeType.label, color: this.formatRuleColor(this.color)}
            const newEdgeRules = [
                ..._.slice(this.edgeRules, 0, this.index),
                edgeRule,
                ..._.slice(this.edgeRules, this.index+1)
            ]
            this.updateEdgeRules({rules: newEdgeRules})

        }
    },
    watch: {
        edgeRules: function(){

        }
    }
}
</script>
<style scoped>
.field {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0.5rem;
    color: white;

}
.color {
    text-align: right;
    min-height: 10px;
}
.color input {
    min-height: 10px;
}
</style>

