<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";

/** The auth service redirects here after the Spotify login, with the tokens in the query. */
const store = useStore();
const route = useRoute();
const router = useRouter();

const single = (value: unknown) =>
  typeof value === "string" ? value : undefined;

onMounted(async () => {
  const error = single(route.query.error);
  const accessToken = single(route.query.access_token);
  const refreshToken = single(route.query.refresh_token);
  const expiresIn = single(route.query.expires_in);

  if (error) {
    store.dispatch(
      "setError",
      `Spotify login failed: ${error.replaceAll("_", " ")}`,
    );
  } else if (accessToken && refreshToken && expiresIn) {
    store.dispatch("setRefreshToken", refreshToken);
    store.dispatch("setExpiryTime", expiresIn);
    store.dispatch("setAccessToken", accessToken);
    store.dispatch("getCurrentUser");
    store.dispatch("setSuccess", "Logged in to Spotify");
  }
  // Replace, so the tokens do not stay in the browser history.
  await router.replace({ name: "Graph" });
});
</script>

<template>
  <div class="flex h-full items-center justify-center text-sm text-fg-muted">
    Logging in…
  </div>
</template>
