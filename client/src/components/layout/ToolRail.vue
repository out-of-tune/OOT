<script setup lang="ts">
import {
  Box,
  ChartScatter,
  CircleQuestionMark,
  Compass,
  Image as ImageIcon,
  ListPlus,
  ListVideo,
  MessageSquare,
  Minus,
  Plus,
  Redo2,
  Save,
  Settings,
  Share2,
  SquareDashedMousePointer,
  Undo2,
} from "@lucide/vue";
import { computed, ref } from "vue";
import CompassMenu from "@/components/popovers/CompassMenu.vue";
import LoadSaveMenu from "@/components/popovers/LoadSaveMenu.vue";
import SelectionActions from "@/components/popovers/SelectionActions.vue";
import IconButton from "@/components/ui/IconButton.vue";
import UiPopover from "@/components/ui/UiPopover.vue";
import { useStore } from "@/store";
import { ACTIVE_MODES } from "@/store/modules/modes";
import type { ActiveMode } from "@/store/types";

const store = useStore();
const activeMode = computed(() => store.state.activeMode);
const selectionOpen = ref(false);
const compassOpen = ref(false);
const compassActive = computed(() => Boolean(store.state.compass.active));
const viewMode = computed(() => store.state.viewMode);
const covers = computed(() => store.state.appearance.covers);
const switchingView = ref(false);

async function toggleViewMode() {
  switchingView.value = true;
  try {
    await store.dispatch("setViewMode", viewMode.value === "3d" ? "2d" : "3d");
  } finally {
    switchingView.value = false;
  }
}
const saveOpen = ref(false);

const MODE_BUTTONS: Record<
  ActiveMode,
  { id: string; label: string; icon: typeof Plus }
> = {
  expand: {
    id: "expand-button",
    label: "Expand: click adds neighbors",
    icon: Plus,
  },
  collapse: {
    id: "collapse-button",
    label: "Collapse: click removes neighbors",
    icon: Minus,
  },
  explore: {
    id: "explore-button",
    label: "Explore: click only shows info",
    icon: Compass,
  },
  queue: {
    id: "queue-button",
    label: "Queue: click adds a song to the queue",
    icon: ListPlus,
  },
};

/** The mode buttons, with the number key that chooses each. */
const modes = ACTIVE_MODES.map((mode, index) => ({
  mode,
  ...MODE_BUTTONS[mode],
  label: `${MODE_BUTTONS[mode].label} (${index + 1})`,
}));

/** Settings and Help open in a new tab, so the graph keeps its state. */
const openInNewTab = (path: string) =>
  window.open(`${window.location.pathname}#${path}`, "_blank", "noopener");
</script>

<template>
  <nav
    id="toolbar"
    aria-label="Tools"
    class="panel theme-rail fixed top-1/2 right-3 z-20 flex -translate-y-1/2 flex-col items-center gap-1 p-1"
  >
    <div
      id="mouse-modes"
      role="radiogroup"
      aria-label="Click mode"
      class="flex flex-col gap-1"
    >
      <IconButton
        v-for="entry in modes"
        :id="entry.id"
        :key="entry.mode"
        role="radio"
        :aria-checked="activeMode === entry.mode"
        :label="entry.label"
        :active="activeMode === entry.mode"
        @click="store.dispatch('setActiveMode', entry.mode)"
      >
        <component :is="entry.icon" />
      </IconButton>
    </div>

    <hr class="my-1 w-6 border-line" />

    <IconButton
      id="view-mode-button"
      :label="
        viewMode === '3d' ? 'Switch to the 2D view' : 'Switch to the 3D view'
      "
      :active="viewMode === '3d'"
      :disabled="switchingView"
      @click="toggleViewMode"
    >
      <Box />
    </IconButton>
    <IconButton
      id="covers-button"
      :label="covers ? 'Hide covers (V)' : 'Show covers (V)'"
      :active="covers"
      @click="store.dispatch('setCovers', !covers)"
    >
      <ImageIcon />
    </IconButton>

    <hr class="my-1 w-6 border-line" />

    <IconButton id="undo-button" label="Undo" @click="store.dispatch('undo')"
      ><Undo2
    /></IconButton>
    <IconButton id="redo-button" label="Redo" @click="store.dispatch('redo')"
      ><Redo2
    /></IconButton>

    <hr class="my-1 w-6 border-line" />

    <UiPopover
      v-model:open="selectionOpen"
      label="Selection actions"
      placement="left"
    >
      <template #trigger="{ open, toggle }">
        <IconButton
          id="selection-button"
          label="Selection"
          :active="open"
          @click="toggle"
        >
          <SquareDashedMousePointer />
        </IconButton>
      </template>
      <template #default="{ close }">
        <SelectionActions @done="close" />
      </template>
    </UiPopover>

    <UiPopover v-model:open="compassOpen" label="Compass" placement="left">
      <template #trigger="{ open, toggle }">
        <IconButton
          id="compass-button"
          label="Compass: place nodes on two axes"
          :active="open || compassActive"
          @click="toggle"
        >
          <ChartScatter />
        </IconButton>
      </template>
      <template #default="{ close }">
        <CompassMenu @done="close" />
      </template>
    </UiPopover>

    <IconButton
      id="playlists-button"
      label="Playlists"
      @click="store.dispatch('changePlaylistLoaderState', true)"
    >
      <ListVideo />
    </IconButton>

    <UiPopover v-model:open="saveOpen" label="Save and load" placement="left">
      <template #trigger="{ open, toggle }">
        <IconButton
          id="io-button"
          label="Save / load"
          :active="open"
          @click="toggle"
        >
          <Save />
        </IconButton>
      </template>
      <LoadSaveMenu />
    </UiPopover>

    <hr class="my-1 w-6 border-line" />

    <IconButton
      id="settings-button"
      label="Settings"
      @click="openInNewTab('/settings')"
    >
      <Settings />
    </IconButton>
    <IconButton id="help-button" label="Help" @click="openInNewTab('/help')">
      <CircleQuestionMark />
    </IconButton>
    <IconButton
      id="feedback-button"
      label="Feedback"
      @click="store.dispatch('changeFeedbackModalState', true)"
    >
      <MessageSquare />
    </IconButton>
    <IconButton
      id="share-button"
      label="Share"
      @click="store.dispatch('changeShareModalState', true)"
    >
      <Share2 />
    </IconButton>
  </nav>
</template>
