<template>
  <div>
    <div id="graphContainer" tabindex="0" ref="graphContainer">
      <div v-show="showTooltip" id="tooltip" tabindex="0" ref="tooltip">
        <span v-if="isPinned">📌</span>{{ tooltipData }}
      </div>
      <NodeLabels :items="nodeLabels"></NodeLabels>
    </div>
    <div class="graph-overlay"></div>
    <NodeInfo v-if="nodeInfoDisplay" class="nodeInfo"></NodeInfo>
    <QueueDisplay v-if="queueDisplay" class="queueDisplay"></QueueDisplay>
    <div class="iconContainer">
      <v-icon v-if="!isRendered" size="24px" id="pauseIcon" color="white">pause</v-icon>
      <v-icon v-if="pendingRequestCount > 0" size="24px" id="loadingIndicator"
        :color="pendingRequestCount > 100 ? 'red' : pendingRequestCount > 10 ? 'yellow' : 'green'">hourglass_empty</v-icon>
      <b style="color: red" v-if="pendingRequestCount > 100">{{ pendingRequestCount }}</b>
      <b style="color: white" v-if="groupMoveActive">M</b>
      <v-icon style="color: white" v-if="highlight">highlight</v-icon>

    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "vuex";
import NodeInfo from "@/components/popovers/NodeInfo"
const QueueDisplay = defineAsyncComponent(() => import("@/components/popovers/QueueDisplay.vue"))
const NodeLabels = defineAsyncComponent(() => import("@/components/helpers/NodeLabels.vue"))
import { getPinnedState } from '@/assets/js/graphHelper'

export default {
  data: () => {
    return {
      zoomLevel: 1,
      previousZoomLevel: 1,
      zoomThreshold: 1.8,
      nodeLabels: [],
      isPinned: false
    }
  },
  components: {
    NodeInfo,
    QueueDisplay,
    NodeLabels
  },
  computed: {
    ...mapState({
      tooltipConfiguration: state =>
        state.configurations.appearanceConfiguration.nodeConfiguration.tooltip,
      hoveredNode: state => state.mainGraph.hoveredNode,
      showTooltip: state => state.mainGraph.displayState.showTooltip,
      queueDisplay: state => state.visibleItems.queueDisplay,
      nodeInfoDisplay: state => state.visibleItems.nodeInfo,
      isRendered: state => state.mainGraph.renderState.isRendered,
      pendingRequestCount: state => state.appearance.pendingRequestCount,
      groupMoveActive: state => state.events.groupMoveActive,
      highlight: state => state.appearance.highlight
    }),
    tooltipData: function () {
      const configuration = this.tooltipConfiguration
        .filter(setting => setting.nodeLabel === this.$store.state.mainGraph.hoveredNode.data.label)
      this.isPinned = this.$store.state.mainGraph.hoveredNode.id != 0 && this.$store.state.mainGraph.hoveredNode ? getPinnedState(this.$store.state, this.$store.state.mainGraph.hoveredNode) : false
      return this.getConfiguredHoveredNodeData(this.hoveredNode, configuration);
    }

  },
  methods: {
    ...mapActions([
      "setGraphContainer",
      "initGraph",
      "resizeGraphContainer",
      "applyCoordinateSystems",
      "applyNodeColorConfiguration",
      "applyNodeSizeConfiguration",
      "applyEdgeColorConfiguration",
      "displayNodeLabels",
      "removeNodeLabels",
      "updateNodeLabels",
      "authenticateClient",
      "requireAccessToken",
      "setLoginState",
      "refreshToken",
      "getCurrentUser",
      "setRefreshToken",
      "importSharedObject",
      "generateInceptionGraph"
    ]),
    addTooltipPositionListener: function () {
      this.$refs.graphContainer.addEventListener(
        "mousemove",
        this.updateTooltipPosition,
        false
      );
    },
    updateTooltipPosition: function (event) {
      this.setTooltipPosition(20, event.pageX, event.pageY);
    },
    setTooltipPosition: function (offset, x, y) {
      this.$refs.tooltip.style.top = y + offset + "px";
      this.$refs.tooltip.style.left = x + offset + "px";
    },
    getConfiguredHoveredNodeData: function (hoveredNode, configuration) {
      if (configuration.length == 0) {
        return hoveredNode.id;
      }
      if (configuration[0].attribute === "_id") {
        return hoveredNode.id;
      }
      return hoveredNode.data[configuration[0].attribute];
    },
    innerWidth: function () {
      return window.innerWidth;
    },
    innerHeight: function () {
      return window.innerHeight;
    },
    resize: function (event) {
      this.resizeGraphContainer({
        width: this.innerWidth(),
        height: this.innerHeight()
      });
    },
    visualizeDomLabelsScale() {
      if (this.zoomLevel > this.zoomThreshold && this.previousZoomLevel < this.zoomThreshold) {
        this.displayNodeLabels()
      }
      else if (this.zoomLevel < this.zoomThreshold && this.previousZoomLevel > this.zoomThreshold) {
        this.removeNodeLabels()
      }
    },
  },
  mounted: async function () {
    await this.authenticateClient()

    if (this.$store.state.authentication.refreshToken) {
      try {
        await this.refreshToken()
        this.getCurrentUser()
      }
      catch (e) {
        this.setLoginState(false)
        this.setRefreshToken('')
        this.requireAccessToken()
      }
    }
    else {
      this.requireAccessToken();
    }

    this.setGraphContainer(this.$refs.graphContainer);
    this.initGraph();

    this.addTooltipPositionListener();
    window.addEventListener("resize", this.resize);
    this.$store.state.mainGraph.renderState.Renderer.on("scale", () => {
      this.previousZoomLevel = this.zoomLevel
      this.zoomLevel = this.$store.state.mainGraph.renderState.Renderer.getTransform().scale
      this.visualizeDomLabelsScale()

    })
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "DELETE_LAYOUT_CONFIGURATION" ||
        mutation.type === "CHANGE_LAYOUT_CONFIGURATION" ||
        mutation.type === "ADD_LAYOUT_CONFIGURATION") {
        this.applyCoordinateSystems()
      }
      if (mutation.type === "ADD_NODE_RULE" ||
        mutation.type === "UPDATE_NODE_RULESET") {
        this.applyNodeColorConfiguration()
        this.applyNodeSizeConfiguration()
      }
      if (mutation.type === "ADD_NODE_RULE" ||
        mutation.type === "UPDATE_EDGE_RULES") {
        this.applyEdgeColorConfiguration()
      }
      if (mutation.type === "ADD_NODE_LABEL" ||
        mutation.type === "REMOVE_NODE_LABEL" ||
        mutation.type === "SET_NODE_LABELS") {
        this.nodeLabels = Object.values(this.$store.state.graph_camera.nodeLabels)
      }
    })
    const { uri, type } = this.$route.query;
    if (uri && type) {
      this.importSharedObject({ uri, type })
    }
    else {
      this.generateInceptionGraph()
    }
  }
};
</script>

<style>
#graphContainer {
  width: 100vw;
  height: 100vh;
  background-color: black;
  overflow: hidden !important;
  position: fixed;
}

.textfield {
  width: 200px;
}

#card {
  padding: 1rem;
  position: fixed;
}

#tooltip {
  position: fixed;
  padding: 5px;
  color: white;
  background-color: blue;
  border: 1px solid white;
}

.graph-selection-indicator {
  position: absolute;
  background: transparent;
  border: 1px solid orange;
}

.graph-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: none;
}

.nodeInfo {
  position: absolute;
  z-index: 1;
  top: 70px;
  left: 0px;
  color: white;
}

.queueDisplay {
  position: absolute;
  z-index: 1;
  bottom: 5rem;
  right: 50px;
  color: white;
}

.iconContainer {
  bottom: 5.5rem;
  z-index: 10;
  position: absolute;
  left: 1rem;
  display: -ms-inline-flexbox;
}

#loadingIndicator {
  background: #22222244;
  animation: rotate 2s cubic-bezier(1, 0.6, 0.4, 1) infinite;

}

#pauseIcon {
  background: #22222244;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(180deg);
  }
}</style>
