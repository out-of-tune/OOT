<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import AppToast from "@/components/AppToast.vue";
import { deepEqual } from "@/lib/deepEqual";
import { useStore } from "@/store";
import { emptyConfiguration } from "@/store/state";

const FeedbackModal = defineAsyncComponent(
  () => import("@/components/modals/FeedbackModal.vue"),
);
const PlaylistLoader = defineAsyncComponent(
  () => import("@/components/modals/PlaylistLoader.vue"),
);
const SelectionModal = defineAsyncComponent(
  () => import("@/components/modals/SelectionModal.vue"),
);
const ShareModal = defineAsyncComponent(
  () => import("@/components/modals/ShareModal.vue"),
);
const IntroTour = defineAsyncComponent(
  () => import("@/components/IntroTour.vue"),
);

const store = useStore();
const route = useRoute();
const onGraph = computed(() => route.name === "Graph");

// A new user (no configuration in local storage) gets the default configuration.
if (deepEqual(store.state.configurations, emptyConfiguration())) {
  store.dispatch("initConfiguration");
}
</script>

<template>
  <RouterView />
  <AppToast />
  <template v-if="onGraph">
    <PlaylistLoader />
    <SelectionModal />
    <FeedbackModal />
    <ShareModal />
    <IntroTour />
  </template>
</template>
