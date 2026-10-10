<script setup lang="ts">
import { computed, ref } from "vue";
import AccountMenu from "@/components/layout/AccountMenu.vue";
import ActionRuleOptions from "@/components/settings/ActionRuleOptions.vue";
import ColorRuleEditor from "@/components/settings/ColorRuleEditor.vue";
import EdgeColorOptions from "@/components/settings/EdgeColorOptions.vue";
import SizeRuleEditor from "@/components/settings/SizeRuleEditor.vue";
import TooltipOption from "@/components/settings/TooltipOption.vue";
import UiSegmented from "@/components/ui/UiSegmented.vue";
import UiSwitch from "@/components/ui/UiSwitch.vue";
import { useStore } from "@/store";

type Page = "nodes" | "edges" | "general";

const store = useStore();
const page = ref<Page>("nodes");
const pages: { value: Page; label: string }[] = [
  { value: "nodes", label: "Nodes" },
  { value: "edges", label: "Edges" },
  { value: "general", label: "General" },
];

const nodeTypes = computed(() => store.state.schema.nodeTypes);
const showTour = computed({
  get: () => store.state.events.showTour,
  set: (value: boolean) => store.dispatch("setShowTour", value),
});
</script>

<template>
  <div id="settings" class="min-h-full bg-canvas">
    <header
      class="sticky top-0 z-10 border-b border-line bg-canvas/85 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3"
      >
        <div class="flex items-center gap-3">
          <img src="@/assets/logo.png" alt="" class="size-6" />
          <h1 class="text-sm font-semibold">Settings</h1>
          <UiSegmented v-model="page" :options="pages" label="Settings page" />
        </div>
        <AccountMenu />
      </div>
    </header>

    <main class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
      <p class="max-w-2xl text-sm text-fg-muted">
        Changes apply at once, also to the graph in your other tab. The
        <RouterLink
          :to="{ name: 'Help', hash: '#settings' }"
          class="text-teal hover:underline"
          >help page</RouterLink
        >
        explains the rule syntax.
      </p>

      <template v-if="page === 'nodes'">
        <section
          v-for="nodeType in nodeTypes"
          :key="nodeType.label"
          :aria-labelledby="`settings-${nodeType.label}`"
          class="panel bg-surface p-5"
        >
          <h2
            :id="`settings-${nodeType.label}`"
            class="mb-4 text-lg font-semibold capitalize"
          >
            {{ nodeType.label }}
          </h2>
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <h3 class="label mb-2">Expand / collapse</h3>
              <ActionRuleOptions :node-label="nodeType.label" />
            </div>
            <div>
              <h3 class="label mb-2">Color rules</h3>
              <ColorRuleEditor :node-label="nodeType.label" />
            </div>
            <div>
              <h3 class="label mb-2">Size rules</h3>
              <SizeRuleEditor :node-label="nodeType.label" />
            </div>
            <div>
              <h3 class="label mb-2">Tooltip shows</h3>
              <TooltipOption :node-type="nodeType" />
            </div>
          </div>
        </section>
      </template>

      <section
        v-else-if="page === 'edges'"
        aria-labelledby="settings-edges"
        class="panel max-w-2xl bg-surface p-5"
      >
        <h2 id="settings-edges" class="mb-2 text-lg font-semibold">
          Edge colors
        </h2>
        <EdgeColorOptions />
      </section>

      <section
        v-else
        aria-labelledby="settings-general"
        class="panel max-w-2xl bg-surface p-5"
      >
        <h2 id="settings-general" class="mb-4 text-lg font-semibold">
          General
        </h2>
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="text-sm font-medium">Show the tour</p>
            <p class="text-sm text-fg-muted">
              Offer the introduction tour when the graph opens.
            </p>
          </div>
          <UiSwitch v-model="showTour" label="Show the tour" />
        </div>
      </section>
    </main>
  </div>
</template>
