import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import store from "./store";
import Vue3Tour from "vue3-tour";
import "vue3-tour/dist/vue3-tour.css";

import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  FaFlag,
  RiZhihuFill,
  MdPlayarrow,
  MdPause,
  MdSkipnext,
  MdSkipprevious,
  MdVolumedown,
  MdVolumeup,
} from "oh-vue-icons/icons";

addIcons(
  FaFlag,
  RiZhihuFill,
  MdPlayarrow,
  MdPause,
  MdSkipnext,
  MdSkipprevious,
  MdVolumedown,
  MdVolumeup,
);

const app = createApp(App);
app.config.productionTip = false;
app.use(store);
app.use(router);
app.use(Vue3Tour);

app.component("v-icon", OhVueIcon);
app.mount("#app");
