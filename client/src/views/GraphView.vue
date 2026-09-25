<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useRoute } from "vue-router";
import GraphStatus from "@/components/graph/GraphStatus.vue";
import NodeInfoPanel from "@/components/graph/NodeInfoPanel.vue";
import NodeLabels from "@/components/graph/NodeLabels.vue";
import BottomBar from "@/components/layout/BottomBar.vue";
import ToolRail from "@/components/layout/ToolRail.vue";
import TopBar from "@/components/layout/TopBar.vue";
import { getPinnedState } from "@/lib/graph";
import { useStore } from "@/store";
import type { GraphNode } from "@/types/graph";

const QueuePanel = defineAsyncComponent(
  () => import("@/components/player/QueuePanel.vue"),
);

/** Zoom level from which node names show as labels. */
const LABEL_ZOOM_THRESHOLD = 1.8;
/** Distance of the tooltip from the mouse pointer, in pixels. */
const TOOLTIP_OFFSET = 16;

const store = useStore();
const route = useRoute();
const container = ref<HTMLElement | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const hoveredNode = computed(() => store.state.mainGraph.hoveredNode);
const showTooltip = computed(
  () =>
    store.state.mainGraph.displayState.showTooltip &&
    hoveredNode.value.id !== 0,
);
const tooltipText = computed(() => {
  const node = hoveredNode.value;
  const rule =
    store.state.configurations.appearanceConfiguration.nodeConfiguration.tooltip.find(
      (setting) => setting.nodeLabel === node.data.label,
    );
  if (!rule || rule.attribute === "_id" || rule.attribute === "id")
    return String(node.id);
  const value = node.data[rule.attribute];
  return value == null ? String(node.id) : String(value);
});
const isPinned = computed(
  () =>
    hoveredNode.value.id !== 0 &&
    getPinnedState(store.state, hoveredNode.value as GraphNode),
);

const nodeLabels = computed(() =>
  Object.values(store.state.graph_camera.nodeLabels),
);
const nodeInfoVisible = computed(() => store.state.visibleItems.nodeInfo);
const queueVisible = computed(() => store.state.visibleItems.queueDisplay);

function onMouseMove(event: MouseEvent) {
  tooltipPosition.value = {
    x: event.clientX + TOOLTIP_OFFSET,
    y: event.clientY + TOOLTIP_OFFSET,
  };
}

function onResize() {
  store.dispatch("resizeGraphContainer", {
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

/** Restores the Spotify session, or gets the public token. */
async function authenticate() {
  if (store.state.authentication.refreshToken) {
    try {
      await store.dispatch("refreshToken");
      store.dispatch("getCurrentUser");
      return;
    } catch {
      store.dispatch("setLoginState", false);
      store.dispatch("setRefreshToken", "");
    }
  }
  try {
    await store.dispatch("requireAccessToken");
  } catch {
    store.dispatch(
      "setError",
      new Error("Could not reach the out-of-tune API"),
    );
  }
}

// Configuration changes, also those from the Settings tab, recolor the graph.
const NODE_RULE_MUTATIONS = [
  "ADD_NODE_RULE",
  "UPDATE_NODE_RULESET",
  "SET_CONFIGURATION",
];
const EDGE_RULE_MUTATIONS = [
  "ADD_NODE_RULE",
  "UPDATE_EDGE_RULES",
  "SET_CONFIGURATION",
];
const LAYOUT_MUTATIONS = [
  "DELETE_LAYOUT_CONFIGURATION",
  "CHANGE_LAYOUT_CONFIGURATION",
  "ADD_LAYOUT_CONFIGURATION",
];

let unsubscribe: (() => void) | undefined;

onMounted(async () => {
  if (!container.value) return;
  store.dispatch("setGraphContainer", container.value);
  store.dispatch("initGraph");
  container.value.focus();
  window.addEventListener("resize", onResize);

  let zoomLevel = 1;
  store.state.mainGraph.renderState.Renderer?.on("scale", () => {
    const previous = zoomLevel;
    zoomLevel =
      store.state.mainGraph.renderState.Renderer?.getTransform().scale ?? 1;
    if (zoomLevel > LABEL_ZOOM_THRESHOLD && previous <= LABEL_ZOOM_THRESHOLD)
      store.dispatch("displayNodeLabels");
    if (zoomLevel <= LABEL_ZOOM_THRESHOLD && previous > LABEL_ZOOM_THRESHOLD)
      store.dispatch("removeNodeLabels");
  });

  unsubscribe = store.subscribe((mutation) => {
    if (LAYOUT_MUTATIONS.includes(mutation.type))
      store.dispatch("applyCoordinateSystems");
    if (NODE_RULE_MUTATIONS.includes(mutation.type)) {
      store.dispatch("applyNodeColorConfiguration");
      store.dispatch("applyNodeSizeConfiguration");
    }
    if (EDGE_RULE_MUTATIONS.includes(mutation.type))
      store.dispatch("applyEdgeColorConfiguration");
  });

  await authenticate();

  const { uri, type } = route.query;
  if (typeof uri === "string" && typeof type === "string") {
    store.dispatch("importSharedObject", { uri, type });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  unsubscribe?.();
  store.commit("DISPOSE_RENDERER");
});
</script>

<template>
  <main class="relative h-full w-full overflow-hidden bg-canvas">
    <div
      id="graphContainer"
      ref="container"
      tabindex="0"
      aria-label="Music graph. Click a node to expand it."
      class="fixed inset-0 overflow-hidden outline-none"
      @mousemove="onMouseMove"
    >
      <NodeLabels :items="nodeLabels" />
    </div>
    <!-- lib/select.ts shows this layer during a SHIFT + drag selection. -->
    <div class="graph-overlay absolute inset-0 hidden" />

    <div
      v-if="showTooltip"
      role="tooltip"
      class="pointer-events-none fixed z-40 max-w-64 rounded-md border border-line bg-surface-raised px-2 py-1 text-xs font-medium text-fg shadow-lg"
      :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
    >
      <span v-if="isPinned" aria-label="pinned">📌 </span>{{ tooltipText }}
    </div>

    <TopBar />
    <ToolRail />

    <div
      class="pointer-events-none fixed top-20 bottom-36 left-3 z-10 flex flex-col gap-3 sm:bottom-28"
    >
      <NodeInfoPanel v-if="nodeInfoVisible" class="pointer-events-auto" />
      <div class="pointer-events-auto mt-auto self-start">
        <GraphStatus />
      </div>
    </div>

    <div class="fixed right-16 bottom-36 z-10 sm:bottom-28">
      <QueuePanel v-if="queueVisible" />
    </div>

    <BottomBar />
  </main>
</template>
