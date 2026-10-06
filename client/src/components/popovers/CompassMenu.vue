<script setup lang="ts">
import { computed, ref, watch } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import { commonTags, opposedTagPairs, type CompassAxis } from "@/lib/compass";
import { getNodesByLabel } from "@/lib/graph";
import { useStore } from "@/store";

const emit = defineEmits<{ done: [] }>();
const store = useStore();

type NodeLabel = "album" | "artist";
const nodeLabel = ref<NodeLabel>("album");

/** Number axes of each node type: the attribute and its name on the axis. */
const NUMBER_AXES: Record<NodeLabel, { attribute: string; label: string }[]> = {
  album: [
    { attribute: "releaseYear", label: "Year" },
    { attribute: "mbRating", label: "Rating" },
    { attribute: "mbVotes", label: "Votes" },
    { attribute: "total_tracks", label: "Tracks" },
  ],
  artist: [
    { attribute: "beginYear", label: "Active since" },
    { attribute: "mbRating", label: "Rating" },
    { attribute: "mbVotes", label: "Votes" },
  ],
};

/** An axis choice in the menu: a number attribute, or "tags" with its two ends. */
interface AxisChoice {
  kind: string;
  from: string;
  to: string;
}

// The graph engine is not reactive, so the tags are read when the menu opens and on demand.
const tags = ref<string[]>([]);
const pairs = ref<[string, string][]>([]);
function readTags() {
  const data = getNodesByLabel(nodeLabel.value, store.state).map(
    (node) => node.data,
  );
  tags.value = commonTags(data);
  pairs.value = opposedTagPairs(data);
}
readTags();
watch(nodeLabel, readTags);

const x = ref<AxisChoice>({ kind: "releaseYear", from: "", to: "" });
const y = ref<AxisChoice>({ kind: "mbRating", from: "", to: "" });

/** "Timeline": year across, rating up. "Tag compass": the two tag pairs that split the nodes best. */
function preset(name: "timeline" | "tags") {
  if (name === "timeline") {
    x.value = {
      kind: nodeLabel.value === "album" ? "releaseYear" : "beginYear",
      from: "",
      to: "",
    };
    y.value = { kind: "mbRating", from: "", to: "" };
    return;
  }
  const [[a, b] = ["", ""], [c, d] = ["", ""]] = pairs.value;
  x.value = { kind: "tags", from: a, to: b };
  y.value = { kind: "tags", from: c, to: d };
}
watch(nodeLabel, () => preset("timeline"));

function toAxis(choice: AxisChoice): CompassAxis | undefined {
  if (choice.kind === "tags")
    return choice.from && choice.to && choice.from !== choice.to
      ? { kind: "tags", from: choice.from, to: choice.to }
      : undefined;
  const option = NUMBER_AXES[nodeLabel.value].find(
    (entry) => entry.attribute === choice.kind,
  );
  return option ? { kind: "attribute", ...option } : undefined;
}

const xAxis = computed(() => toAxis(x.value));
const yAxis = computed(() => toAxis(y.value));
const active = computed(() => store.state.compass.active);

function apply() {
  if (!xAxis.value || !yAxis.value) return;
  store.dispatch("applyCompass", {
    nodeLabel: nodeLabel.value,
    xAxis: xAxis.value,
    yAxis: yAxis.value,
  });
  emit("done");
}

function release() {
  store.dispatch("releaseCompass");
  emit("done");
}

const axes = [
  { name: "Across", model: x },
  { name: "Up", model: y },
];
</script>

<template>
  <div class="flex w-80 flex-col gap-3 p-3">
    <div>
      <h2 class="text-sm font-semibold">Compass</h2>
      <p class="mt-1 text-xs leading-relaxed text-fg-subtle">
        Places the nodes of one type on two axes. Tags and ratings come from
        MusicBrainz. Nodes without a value wait in rows under the plane.
      </p>
    </div>
    <UiSegmented
      v-model="nodeLabel"
      label="Node type"
      :options="[
        { value: 'album', label: 'Albums' },
        { value: 'artist', label: 'Artists' },
      ]"
    />
    <div class="flex gap-1.5">
      <UiButton size="sm" class="flex-1" @click="preset('timeline')"
        >Timeline</UiButton
      >
      <UiButton
        size="sm"
        class="flex-1"
        :disabled="pairs.length < 2"
        :title="
          pairs.length < 2
            ? 'Needs nodes with MusicBrainz tags'
            : 'Two pairs of tags that split the nodes'
        "
        @click="preset('tags')"
        >Tag compass</UiButton
      >
    </div>
    <div v-for="axis in axes" :key="axis.name" class="flex flex-col gap-1.5">
      <label class="label" :for="`compass-${axis.name}`">{{ axis.name }}</label>
      <select
        :id="`compass-${axis.name}`"
        v-model="axis.model.value.kind"
        class="field"
      >
        <option
          v-for="option in NUMBER_AXES[nodeLabel]"
          :key="option.attribute"
          :value="option.attribute"
        >
          {{ option.label }}
        </option>
        <option value="tags" :disabled="tags.length < 2">
          From one tag to another
        </option>
      </select>
      <div v-if="axis.model.value.kind === 'tags'" class="flex gap-1.5">
        <select
          v-model="axis.model.value.from"
          class="field"
          :aria-label="`${axis.name}: from tag`"
        >
          <option value="" disabled>from…</option>
          <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <select
          v-model="axis.model.value.to"
          class="field"
          :aria-label="`${axis.name}: to tag`"
        >
          <option value="" disabled>to…</option>
          <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </div>
    <div class="flex gap-1.5">
      <UiButton
        v-if="active"
        size="sm"
        variant="ghost"
        class="flex-1"
        @click="release"
        >Release</UiButton
      >
      <UiButton
        size="sm"
        variant="primary"
        class="flex-1"
        :disabled="!xAxis || !yAxis"
        @click="apply"
        >Place nodes</UiButton
      >
    </div>
  </div>
</template>
