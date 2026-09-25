<script setup lang="ts">
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { computed } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import { useStore } from "@/store";

const store = useStore();
const showTour = computed(() => store.state.events.showTour);

const steps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to out-of-tune",
      description:
        "out-of-tune shows the world of music as a graph. Each dot is a genre, an artist, an album or a song.",
    },
  },
  {
    element: ".search",
    popover: {
      title: "Search",
      description:
        "Start with a search for an artist, song, album or genre. The results go into the graph.",
      side: "bottom",
    },
  },
  {
    element: "#graphContainer",
    popover: {
      title: "Explore the graph",
      description:
        "Click nodes, select several with Shift + drag, and move them. Press Space to pause the motion.",
    },
  },
  {
    element: "#mouse-modes",
    popover: {
      title: "Click modes",
      description:
        "Expand adds the neighbors of a node. Collapse removes them. Explore only shows the node info.",
      side: "left",
    },
  },
  {
    element: "#undo-button",
    popover: {
      title: "Undo",
      description: "Undo your last change.",
      side: "left",
    },
  },
  {
    element: "#redo-button",
    popover: {
      title: "Redo",
      description: "Redo the change you undid.",
      side: "left",
    },
  },
  {
    element: "#selection-button",
    popover: {
      title: "Selection",
      description: "Expand, remove, pin or queue all selected nodes at once.",
      side: "left",
    },
  },
  {
    element: "#playlists-button",
    popover: {
      title: "Playlists",
      description:
        "Log in to Spotify to turn your playlists into graphs and to edit them.",
      side: "left",
    },
  },
  {
    element: "#io-button",
    popover: {
      title: "Save and load",
      description: "Keep graphs and configurations for later.",
      side: "left",
    },
  },
  {
    element: "#settings-button",
    popover: {
      title: "Settings",
      description:
        "Change colors, sizes and expand rules. The Help page explains each option.",
      side: "left",
    },
  },
  {
    element: "#help-button",
    popover: {
      title: "Help",
      description: "All keyboard shortcuts and a full guide.",
      side: "left",
    },
  },
  {
    element: "#share-button",
    popover: {
      title: "Share",
      description: "Send your graph to your friends.",
      side: "left",
    },
  },
  {
    element: ".nodeInfo",
    popover: {
      title: "Node info",
      description:
        "The last node you clicked shows here. Play previews and queue songs from it.",
      side: "right",
    },
  },
  {
    popover: {
      title: "Have fun",
      description: "Thank you for using out-of-tune!",
    },
  },
];

function startTour() {
  store.dispatch("setShowTour", false);
  driver({
    showProgress: true,
    popoverClass: "oot-tour",
    overlayColor: "#000",
    overlayOpacity: 0.6,
    // Steps whose element is not on screen (for example a closed panel) are skipped.
    steps: steps.filter(
      (step) => !step.element || document.querySelector(step.element as string),
    ),
  }).drive();
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <section
      v-if="showTour"
      aria-labelledby="tour-title"
      class="panel fixed top-24 left-1/2 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col gap-3 bg-surface p-5"
    >
      <h2 id="tour-title" class="text-base font-semibold">New here?</h2>
      <p class="text-sm leading-relaxed text-fg-muted">
        Take a short tour of out-of-tune. For every detail, see the
        <RouterLink
          :to="{ name: 'Help' }"
          target="_blank"
          class="text-teal hover:underline"
          >help page</RouterLink
        >.
      </p>
      <div class="flex justify-end gap-2">
        <UiButton variant="ghost" @click="store.dispatch('setShowTour', false)"
          >Skip</UiButton
        >
        <UiButton variant="primary" @click="startTour">Start tour</UiButton>
      </div>
    </section>
  </Transition>
</template>
