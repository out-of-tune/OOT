<template>
  <v-app id="inspire">
    <Analytics></Analytics>
    <snackbar/>
    <div class="topbar">
      <div>
        <a href="/">
          <span class="hidden-sm-and-down title">out-of-tune</span>
        </a>
      </div>
      <Searchbar v-if="['Graph', 'Settings'].indexOf($route.name)>-1"></Searchbar>
      <div class="login" v-if="['Graph', 'Settings'].indexOf($route.name)>-1">
        <v-btn small v-if="!loggedIn" id="login" outline color="#ffffff" v-on:click="loginUser">login</v-btn>
        <div v-if="loggedIn" class="username"><b>{{$store.state.user.me.display_name}}</b></div>
        <v-btn small v-if="loggedIn" id="logout" outline color="#ffffff" v-on:click="logoutUser">logout</v-btn>
      </div>
    </div>
    <router-view></router-view>
    <PlaylistLoader></PlaylistLoader>
    <PlaylistChooser></PlaylistChooser>
    <selectionModal></selectionModal>
    <feedbackModal></feedbackModal>
    <shareModal></shareModal>
    <IntroTour v-if="['Graph'].indexOf($route.name)>-1"></IntroTour>
    <MusicPlayer class="musicPlayer" v-if="['Graph'].indexOf($route.name)>-1"></MusicPlayer>

    <Toolbar v-if="['Graph'].indexOf($route.name)>-1"></Toolbar>
  </v-app>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Toolbar from "./components/Toolbar.vue";
import IntroTour from "@/components/helpers/IntroTour"

const PlaylistLoader = () => import("@/components/modals/PlaylistLoader")
const PlaylistChooser = () => import("@/components/modals/PlaylistChooser")

const snackbar = () => import("./components/Snackbar")
import Searchbar from "./components/Searchbar.vue"
const selectionModal = () => import("@/components/modals/SelectionModal")
import MusicPlayer from "./components/MusicPlayer"
const feedbackModal = () => import('./components/modals/FeedbackModal')
import Analytics from "./components/Analytics"
const shareModal = () => import("./components/modals/ShareModal")
import "cookieconsent/build/cookieconsent.min.css"

//helper function
function deepEqual(obj1, obj2) {
  function isPrimitive(obj) {
    return obj !== Object(obj);
  }
  if (obj1 === obj2)
    return true;
  if (isPrimitive(obj1) && isPrimitive(obj2))
    return obj1 === obj2;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  for (let key in obj1) {
    if (!(key in obj2)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export default {
  components: {
    Toolbar,
    PlaylistLoader,
    PlaylistChooser,
    snackbar,
    Searchbar,
    selectionModal,
    MusicPlayer,
    feedbackModal,
    Analytics,
    shareModal,
    IntroTour
  },
  data: () => ({
    drawer: null
  }),
  methods: {
    ...mapActions([
      "initConfiguration", 
      "requireAccessToken", 
      "refreshToken", 
      "setLoginState", 
      "getCurrentUser", 
      "login", 
      "logout", 
      "initCookieConsent",
      "requireAccessToken",
      "authenticateClient"
    ]),
    loginUser(){
      this.login()
      event({
        eventCategory: "user",
        eventAction: "login"
      })
    },
    logoutUser(){
      this.logout()
      event({
        eventCategory: "user",
        eventAction: "logout"
      })
    }
  },
  computed: {
    ...mapState({
      loggedIn: state => state.authentication.loginState
    })
  },
  created: async function() {
    this.initCookieConsent()
    //init config when no config is in localStorage
    if (
      deepEqual(this.$store.state.configurations, {
        actionConfiguration: {
          expand: [],
          collapse: []
        },
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: [],
            tooltip: []
          },
          edgeConfiguration: {
            color: [],
            size: []
          }
        }
      })
    ) {
      this.initConfiguration();
    }

  }
};
</script>

<style scoped>
#navDrawer {
  background-color: #212121;
  border-right: 2px solid #da6a1d !important;
}
.musicPlayer {
  position: absolute;
  z-index: 2;
  bottom: 0px;
  left: 0px;
  color: white;
}
a {
  color: inherit;
  text-decoration: inherit;
}
.topbar {
  background-color: #252525;
  color: white;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  height: 64px;
  align-items: center;
  padding-right: 35px;
  padding-left: 35px;
  grid-gap: 0.5rem;
  position: fixed;
  z-index: 2;
  width: 100vw;
}
.login {
  justify-self: right;
  display: flex;
  align-items: center;
}
</style>