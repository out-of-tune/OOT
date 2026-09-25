<script setup lang="ts">
import { LogIn, LogOut } from "@lucide/vue";
import { computed } from "vue";
import UiButton from "@/components/ui/UiButton.vue";
import { useStore } from "@/store";

const store = useStore();
const loggedIn = computed(() => store.state.authentication.loginState);
const user = computed(() => store.state.user.me);
const avatar = computed(() => user.value.images?.[0]?.url);

async function login() {
  try {
    await store.dispatch("login");
  } catch {
    store.dispatch("setError", new Error("The login page could not be loaded"));
  }
}
</script>

<template>
  <div class="panel flex items-center gap-2 p-1.5">
    <UiButton v-if="!loggedIn" id="login" variant="primary" @click="login">
      <LogIn class="size-4" /> Log in<span class="hidden lg:inline">
        with Spotify</span
      >
    </UiButton>
    <template v-else>
      <div class="flex items-center gap-2 pl-1.5">
        <img
          v-if="avatar"
          :src="avatar"
          alt=""
          class="size-7 rounded-full object-cover"
        />
        <span
          v-else
          class="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white uppercase"
        >
          {{ (user.display_name ?? "?").charAt(0) }}
        </span>
        <span class="hidden max-w-40 truncate text-sm font-medium lg:inline">{{
          user.display_name
        }}</span>
      </div>
      <UiButton
        id="logout"
        variant="ghost"
        size="sm"
        @click="store.dispatch('logout')"
      >
        <LogOut class="size-3.5" /> Log out
      </UiButton>
    </template>
  </div>
</template>
