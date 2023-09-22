<template>
  <div>
    <!-- The Modal -->
    <div v-if="open" id="myModal" class="modal">
      <!-- Modal content -->
      <div class="modal-content">
        <v-icon
          dark
          @click="changeSelectionModalState"
          class="close"
          icon="mdi-close"
        />
        <div class="playlist-box">
          <div>
            <h2>Selected Nodes</h2>
            <div
              @click="showDetailedCounts = !showDetailedCounts"
              id="fullCount"
              class="nodeCount"
            >
              Selected nodes: {{ selectedNodes.length }}
            </div>
            <div v-if="showDetailedCounts">
              <div
                class="nodeCount"
                :key="schema.label"
                v-for="schema in nodeTypes"
              >
                {{ schema.label }} count:
                {{
                  selectedNodes.filter(
                    (node) => node.data.label === schema.label,
                  ).length
                }}
              </div>
            </div>
            <div class="spacer"></div>
            <PaginatedList
              :listData="selectedNodes"
              colorPath="selectedNode.color"
              columnOnePath="selectedNode.data.name"
              columnTwoPath="selectedNode.data.label"
              :columnTwoStyle="{
                fontStyle: 'italic',
                textAlign: 'right',
                paddingRight: '2rem',
              }"
              :columnOneStyle="{ paddingLeft: '2rem' }"
              :itemClick="showNodeInformation"
            >
            </PaginatedList>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import PaginatedList from "@/components/helpers/PaginatedList";
import { getNodeColor } from "@/assets/js/graphHelper";

export default {
  data: () => ({
    clickedNode: { data: {} },
    showDetailedCounts: false,
  }),
  components: {
    PaginatedList,
  },
  computed: {
    ...mapState({
      open: (state) => state.selection.modalOpen,
      nodeTypes: (state) => state.schema.nodeTypes,
    }),
    selectedNodes: {
      get() {
        return this.$store.state.selection.selectedNodes.map((node) => {
          const color = getNodeColor(this.$store.state, node);
          return { ...node, color: "#" + color.toString(16).padStart(8, "0") };
        });
      },
    },
  },
  watch: {
    selectedNodes: function (newSelectedNodes, oldSelectedNodes) {
      if (newSelectedNodes.length === 0) {
        this.clickedNode.data = {};
      }
    },
  },
  methods: {
    ...mapActions([
      "changeSelectionModalState",
      "expandSelectedNodes",
      "collapseSelectedNodes",
      "removeSelectedNodes",
      "moveToNode",
      "addSelectedSongsToQueue",
      "pinNodes",
      "unpinNodes",
    ]),
    showNodeInformation: function (node) {
      this.clickedNode = node;
      this.moveToNode(node);
    },
    pinSelectedNodes: function () {
      this.pinNodes(this.selectedNodes);
    },
    unpinSelectedNodes: function () {
      this.unpinNodes(this.selectedNodes);
    },
  },
  mounted: function () {},
};
</script>
<style scoped>
.list {
  height: 100%;
}
/* The Modal (background) */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 100; /* Sit on top */
  padding-top: 10%; /* Location of the box */
  padding-left: 10%;
  padding-right: 10%;
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding: 1rem;

  margin: 0.5rem;
  overflow-y: auto;
}

/* The Close Button */
.close {
  grid-area: actions;
  position: sticky;
  top: 0;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  cursor: pointer;
  float: right;
  border-radius: 2px 0 0 0;
  box-shadow: -1px -1px -13px -6px rgba(0, 0, 0, 1);
}

.close:hover,
.close:focus {
  color: #000;
  cursor: pointer;
}

ul {
  list-style-type: none;
  padding: 0;
}

#selectedNodes {
  display: grid;
  grid-auto-flow: dense;
  grid-auto-rows: auto;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-gap: 0.5rem;
}

li {
  background-color: rgb(247, 247, 247);
  padding: 0.5rem;
  cursor: pointer;
}
li:hover {
  background-color: rgb(235, 235, 235);
}

.btn {
  background: #ffffff;
  border: 1px solid #2d9cdb;
  box-sizing: border-box;
  box-shadow: 1px 1px 4px rgba(45, 156, 219, 0.25);
  border-radius: 5px;
  padding: 3px;
  margin-right: 1rem;
  width: 100px;
  margin-bottom: 1rem;
}

.btn:active {
  background: #2d9cdb;
}

.btn:hover {
  background: linear-gradient(180deg, #2d9cdb 0%, #56ccf2 100%);
  color: white;
}

#nodeInformation {
  display: grid;
  grid-template-columns: 4fr 1fr;
  grid-gap: 1rem;
}

.nodeCount {
  font-style: italic;
}
#fullCount {
  cursor: pointer;
}
.spacer {
  height: 0.5rem;
}
</style>
