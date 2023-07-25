import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import '@mdi/font/css/materialdesignicons.css'
import store from './store'
import Vue3Tour from 'vue3-tour'
import 'vue3-tour/dist/vue3-tour.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.config.productionTip = false
app.use(store)
app.use(router)
app.use(Vue3Tour)

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
})

app.mount('#app')
