<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { axisEnds } from "@/lib/compass";
import { useStore } from "@/store";

/** Space between the plane and the axis ends, relative to the plane side. */
const MARGIN = 0.08;

const store = useStore();
const compass = computed(() => store.state.compass.active);

interface Point {
  x: number;
  y: number;
}
/** Screen points of the axis ends: left, right, bottom, top. */
const ends = ref<[Point, Point, Point, Point] | null>(null);

let frame = 0;
/** Projects the axis ends on each frame, so the axes follow pan, zoom and the 3D camera. */
function track() {
  const active = compass.value;
  const renderer = store.state.mainGraph.renderState.Renderer;
  if (active && renderer) {
    const graphics = renderer.getGraphics();
    const halfX = (active.width / 2) * (1 + MARGIN);
    const halfY = (active.height / 2) * (1 + MARGIN);
    const points = [
      { x: -halfX, y: 0 },
      { x: halfX, y: 0 },
      { x: 0, y: -halfY * active.up },
      { x: 0, y: halfY * active.up },
    ].map((point) => graphics.toScreen({ ...point, z: 0 }));
    const next = points.every((point) => point.visible)
      ? (points.map(({ x, y }) => ({ x, y })) as [Point, Point, Point, Point])
      : null;
    // Most frames do not move the view. Only a change goes to Vue.
    if (JSON.stringify(next) !== JSON.stringify(ends.value)) ends.value = next;
  }
  frame = requestAnimationFrame(track);
}

watch(
  compass,
  (active) => {
    cancelAnimationFrame(frame);
    ends.value = null;
    if (active) frame = requestAnimationFrame(track);
  },
  { immediate: true },
);
onBeforeUnmount(() => cancelAnimationFrame(frame));

const labels = computed(() => {
  const active = compass.value;
  if (!active) return null;
  const [left, right] = axisEnds(active.xAxis, active.xRange);
  const [bottom, top] = axisEnds(active.yAxis, active.yRange);
  return { left, right, bottom, top };
});
</script>

<template>
  <svg
    v-if="ends && labels"
    class="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    aria-hidden="true"
  >
    <defs>
      <marker
        id="compass-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>
    <g class="text-fg-muted" stroke="currentColor" stroke-width="1.5">
      <line
        :x1="ends[0].x"
        :y1="ends[0].y"
        :x2="ends[1].x"
        :y2="ends[1].y"
        marker-start="url(#compass-arrow)"
        marker-end="url(#compass-arrow)"
      />
      <line
        :x1="ends[2].x"
        :y1="ends[2].y"
        :x2="ends[3].x"
        :y2="ends[3].y"
        marker-start="url(#compass-arrow)"
        marker-end="url(#compass-arrow)"
      />
    </g>
    <g
      class="fill-fg text-sm font-semibold"
      paint-order="stroke"
      stroke="black"
      stroke-width="4"
    >
      <text :x="ends[0].x - 10" :y="ends[0].y + 5" text-anchor="end">
        {{ labels.left }}
      </text>
      <text :x="ends[1].x + 10" :y="ends[1].y + 5">{{ labels.right }}</text>
      <text :x="ends[2].x" :y="ends[2].y + 22" text-anchor="middle">
        {{ labels.bottom }}
      </text>
      <text :x="ends[3].x" :y="ends[3].y - 12" text-anchor="middle">
        {{ labels.top }}
      </text>
    </g>
  </svg>
</template>
