import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { activeThemeId, switchTheme, themeById } from "./lib/themes";
import store, { key } from "./store";
import "./styles/main.css";

// The UI theme follows the store, also when another tab changes it.
store.watch(
  (state) => activeThemeId(state.appearance),
  (theme, previous) => switchTheme(themeById(theme), previous !== undefined),
  { immediate: true },
);

createApp(App).use(store, key).use(router).mount("#app");
