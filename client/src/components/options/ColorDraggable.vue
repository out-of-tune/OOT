<template>
  <div>
    <h3>Rules</h3>
    <div class="list-group-item">
      <draggable :list="ruleset" @change="onChange" item-key="id">
        <template #item="{ element }">
          <li class="item">
            <div class="color" :style="{ background: formatColor(element.color) }">
              {{element.color}}
            </div>
            <div class="text">{{ getRuleString(element) }}</div>
            <div class="close" @click="removeAt(index)">x</div>
          </li>
        </template>
      </draggable>
    </div>
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
      colorRules: state => state.configurations.appearanceConfiguration.nodeConfiguration.color
    }),
    ruleset: {
      get() {
        const nodeLabel = this.nodeType.label

        const rulesets = this.colorRules.filter(function (node) {
          return node.nodeLabel === nodeLabel
        })
        if (rulesets.length > 0) {
          return rulesets[0].rules.filter((rule, index) => index != 0)
        }
        return []

      }
    }
  },
  methods: {
    ...mapActions([
      'updateRuleset'
    ]),
    getRuleString: function (rule) {
      return rule.searchString
    },
    formatColor: function (color) {
      return "#" + color
    },
    removeAt(idx) {
      let newRuleset = this.ruleset
      newRuleset.splice(idx, 1)
      this.updateRuleset({ ruleset: newRuleset, nodeLabel: this.nodeType.label, type: "color" })
    },
    onChange() {
      this.updateRuleset({ ruleset: this.ruleset, nodeLabel: this.nodeType.label, type: "color" })
    }
  }
}
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
  grid-template-columns: 1.5rem 1fr 1.5rem;
  background: white;
  color: black;
  margin-top: 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.item .text {
  padding-left: 0.5rem;
}

.color {
  height: 100%;
  width: 1.5rem;
  border-right: 2px solid black;
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
