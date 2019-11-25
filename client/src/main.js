import Vue from 'vue'
import './plugins/vuetify'
import router from './router'
import App from './App.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import store from './store'
import axios from "axios";
import VueAnalytics from 'vue-analytics'
import VueTour from 'vue-tour'

require('vue-tour/dist/vue-tour.css')

Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_ANALYTICS,
  disabled: false,
  router
})

Vue.use(VueTour)

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
