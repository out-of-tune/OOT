<template>
    <div>
      <h3>Rules</h3>

      <draggable
        :list="ruleset" @change="onChange"
      >
        <div
          class="list-group-item"
          v-for="(element, index) in ruleset"
          :key="index"
        >
          <li class="item">
            <div class="size">{{ getRuleValue(element) }}</div>
            <div class="text">{{ getRuleString(element) }}</div>
            <div class="close" @click="removeAt(index)">x</div>
          </li>
        </div>
      </draggable>
    </div>
</template>

<script>
import draggable from "vuedraggable"
import { mapState, mapActions } from "vuex"
export default {
  components: {
    draggable
  },
  props: [
      'nodeType'
  ],
  computed: {
    ...mapState({
            sizeRules: state => state.configurations.appearanceConfiguration.nodeConfiguration.size
        }),
    ruleset: {
        get: function() {
            const nodeLabel = this.nodeType.label

            const rulesets = this.sizeRules.filter(function (node){
                return node.nodeLabel === nodeLabel
            })
            if (rulesets.length > 0){
                return rulesets[0].rules.filter((rule, index)=>index!=0)
            }
            return []
        }
    }
  },
  methods: {
    ...mapActions([
        'updateRuleset'
    ]),
    getRuleString: function(rule){
        switch (rule.sizeType){
            case "compare":
                return rule.searchString
            case "map":
                return `
                    ${rule.searchObject.nodeType}: ${rule.searchObject.attributes[0].attributeSearch}
                `
        }
    },
    getRuleValue: function(rule){
        switch (rule.sizeType){
            case "compare":
                return rule.size
            case "map":
                return `
                    MAP ${rule.min} | ${rule.max}
                `
        }
    },
    removeAt(idx) {
      let newRuleset = this.ruleset
      newRuleset.splice(idx, 1)
      this.updateRuleset({ ruleset: newRuleset, nodeLabel: this.nodeType.label, type: "size" })
    },
    onChange() {
      this.updateRuleset({ ruleset: this.ruleset, nodeLabel: this.nodeType.label, type: "size" })
    }
  }
};
</script>
<style scoped>
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.item {
    list-style-type: none;
    display: grid;
    grid-template-columns: 90px 2fr 1.5rem;
    background: white;
    color: black;
    margin-top: 1rem;
    font-size: 1rem;
    cursor: pointer;
}
.size {
  border-right: 2px solid black;
  text-align: center;
}
.item .text {
  padding-left: 0.5rem;
}
.close {
  height: 100%;
  width: 1.5rem;
  border-left: 2px solid black;
  text-align: center;
}
.close:hover {
  background-color: grey;
}
h3 {
    color: white;
}
</style>