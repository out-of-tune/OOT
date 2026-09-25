<script setup lang="ts">
import { ListMusic } from "@lucide/vue";
import { computed } from "vue";
import SearchBar from "@/components/search/SearchBar.vue";
import { useStore } from "@/store";
import AccountMenu from "./AccountMenu.vue";

const store = useStore();
const loggedIn = computed(() => store.state.authentication.loginState);
const playlistName = computed(() => store.state.playlists.currentPlaylist.name);
</script>

<template>
  <header
    class="topbar pointer-events-none fixed inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-3"
  >
    <div class="pointer-events-auto flex flex-wrap items-center gap-3">
      <div class="panel flex items-center gap-3 p-1.5 pl-3">
        <img src="@/assets/logo.png" alt="out-of-tune" class="size-6" />
        <SearchBar />
      </div>
      <p
        v-if="loggedIn && playlistName"
        class="panel flex items-center gap-2 px-3 py-2 text-xs text-fg-muted"
        title="Songs are added to this playlist"
      >
        <ListMusic class="size-3.5" />
        <span class="max-w-48 truncate">{{ playlistName }}</span>
      </p>
    </div>
    <div class="pointer-events-auto">
      <AccountMenu />
    </div>
  </header>
</template>
