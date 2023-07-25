import { createApp, ref } from 'vue'
import router from './router'
import App from './App.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import store from './store'
import axios from "axios";
import VueTour from 'vue-tour'
import vuetify from './plugins/vuetify'

require('vue-tour/dist/vue-tour.css')

const app = createApp(App).mount('#app')
app.use(VueTour)
app.prototype.$http = axios
app.config.productionTip = false
app.use(store)
app.use(router)

app.use(vuetify, {
  theme: {
    primary: "#302c29",
    secondary: "#da6a1d",
    accent: "#795548",
    error: "#f44336",
    warning: "#E65100",
    info: "#607D8B",
    success: "#4CAF50"
  },
  customProperties: true,
  iconfont: 'md',
})

app.mount('#app')
