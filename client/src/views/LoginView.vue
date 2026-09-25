<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";

/**
 * The auth service redirects here after the Spotify login. The URL carries no token:
 * the session lives in an httpOnly cookie, and refreshToken turns it into an access token.
 */
const store = useStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const error =
    typeof route.query.error === "string" ? route.query.error : undefined;
  if (error) {
    store.dispatch(
      "setError",
      `Spotify login failed: ${error.replaceAll("_", " ")}`,
    );
  } else if (route.query.status === "success") {
    try {
      await store.dispatch("refreshToken");
      await store.dispatch("getCurrentUser");
      store.dispatch("setSuccess", "Logged in to Spotify");
    } catch {
      store.dispatch("setError", "Spotify login failed: no session");
    }
  }
  await router.replace({ name: "Graph" });
});
</script>

<template>
  <div class="flex h-full items-center justify-center text-sm text-fg-muted">
    Logging in…
  </div>
</template>
