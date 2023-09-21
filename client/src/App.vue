<template>
  <v-app>
    <snackbar />
    <div class="topbar">
      <div>
        <a href="/">
          <span class="hidden-sm-and-down title">out-of-tune</span>
        </a>
      </div>
      <Searchbar
        v-if="['Graph', 'Settings'].indexOf($route.name) > -1"
      ></Searchbar>
      <div class="login" v-if="['Graph', 'Settings'].indexOf($route.name) > -1">
        <v-btn small v-if="!loggedIn" id="login" v-on:click="loginUser"
          >login</v-btn
        >
        <div v-if="loggedIn" class="username">
          <b>{{ $store.state.user.me.display_name }}</b>
        </div>
        <v-btn
          small
          v-if="loggedIn"
          id="logout"
          outline
          color="#ffffff"
          v-on:click="logoutUser"
          >logout</v-btn
        >
      </div>
    </div>
    <router-view></router-view>
    <PlaylistLoader></PlaylistLoader>
    <PlaylistChooser></PlaylistChooser>
    <selectionModal></selectionModal>
    <feedbackModal></feedbackModal>
    <shareModal></shareModal>
    <!-- TODO: fix intro tour -->
    <!-- <IntroTour v-if="['Graph'].indexOf($route.name) > -1"></IntroTour> -->
    <MusicPlayer
      class="musicPlayer"
      v-if="['Graph'].indexOf($route.name) > -1"
    ></MusicPlayer>

    <Toolbar v-if="['Graph'].indexOf($route.name) > -1"></Toolbar>
  </v-app>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "vuex";
import Toolbar from "./components/Toolbar.vue";
import IntroTour from "@/components/helpers/IntroTour";

const PlaylistLoader = defineAsyncComponent(() =>
  import("@/components/modals/PlaylistLoader")
);
const PlaylistChooser = defineAsyncComponent(() =>
  import("@/components/modals/PlaylistChooser")
);

const snackbar = defineAsyncComponent(() => import("./components/Snackbar"));
import Searchbar from "./components/Searchbar.vue";
const selectionModal = defineAsyncComponent(() =>
  import("@/components/modals/SelectionModal")
);
import MusicPlayer from "./components/MusicPlayer";
const feedbackModal = defineAsyncComponent(() =>
  import("./components/modals/FeedbackModal")
);
const shareModal = defineAsyncComponent(() =>
  import("./components/modals/ShareModal")
);

import { deepEqual } from "@/utils/deepEqual.js";

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
    shareModal,
    IntroTour,
  },
  data: () => ({
    drawer: null,
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
      "requireAccessToken",
      "authenticateClient",
    ]),
    loginUser() {
      this.login();
    },
    logoutUser() {
      this.logout();
    },
  },
  computed: {
    ...mapState({
      loggedIn: (state) => state.authentication.loginState,
    }),
  },
  created: async function () {
    //init config when no config is in localStorage
    if (
      deepEqual(this.$store.state.configurations, {
        actionConfiguration: {
          expand: [],
          collapse: [],
        },
        appearanceConfiguration: {
          nodeConfiguration: {
            color: [],
            size: [],
            tooltip: [],
          },
          edgeConfiguration: {
            color: [],
            size: [],
          },
        },
      })
    ) {
      this.initConfiguration();
    }
  },
};
</script>

<style>
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

.btn {
  background: #313131;
  border: 1px solid #2d9cdb;
  box-sizing: border-box;
  box-shadow: 1px 1px 4px rgba(45, 156, 219, 0.25);
  border-radius: 5px;
  padding: 3px;
  margin-right: 1rem;
  width: 100px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.btn:active {
  background: #2d9cdb;
}
.btn:hover {
  background: linear-gradient(180deg, #2d9cdb 0%, #56ccf2 100%);
  color: white;
}

.btn-orange {
  background: #313131;
  border: 1px solid #f2994a;
  box-sizing: border-box;
  box-shadow: 1px 1px 4px rgba(242, 152, 74, 0.25);
  border-radius: 5px;
  padding: 3px;
  margin-right: 1rem;
  width: 100px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.btn-orange:hover {
  background: linear-gradient(180deg, #f2994a 0%, rgb(240, 131, 35) 100%);
  color: white;
}
</style>
