import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
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