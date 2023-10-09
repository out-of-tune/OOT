<template>
  <div id="app">
    <snackbar />
    <div class="topbar">
      <Searchbar
        v-if="['Graph', 'Settings'].indexOf($route.name) > -1"
      ></Searchbar>
      <div v-if="loggedIn">
        {{ $store.state.playlists.currentPlaylist.name }}
      </div>
    </div>
    <div class="login" v-if="['Graph', 'Settings'].indexOf($route.name) > -1">
      <button class="btn" v-if="!loggedIn" id="login" v-on:click="loginUser">
        login
      </button>
      <div v-if="loggedIn" class="username">
        <b>{{ $store.state.user.me.display_name }}</b>
      </div>
      <button
        v-if="loggedIn"
        id="logout"
        color="#ffffff"
        v-on:click="logoutUser"
      >
        logout
      </button>
    </div>
    <router-view></router-view>
    <PlaylistLoader></PlaylistLoader>
    <PlaylistChooser></PlaylistChooser>
    <selectionModal></selectionModal>
    <feedbackModal></feedbackModal>
    <shareModal></shareModal>
    <IntroTour></IntroTour>
    <div v-if="['Graph'].indexOf($route.name) > -1" class="bottom">
      <InfoToggles></InfoToggles>
      <MusicPlayer class="musicPlayer"></MusicPlayer>
    </div>

    <Toolbar v-if="['Graph'].indexOf($route.name) > -1"></Toolbar>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapActions, mapState } from "vuex";
import Toolbar from "./components/Toolbar.vue";
import IntroTour from "./components/helpers/IntroTour.vue";
import InfoToggles from "./components/InfoToggles.vue";

const PlaylistLoader = defineAsyncComponent(() =>
  import("@/components/modals/PlaylistLoader.vue"),
);
const PlaylistChooser = defineAsyncComponent(() =>
  import("@/components/modals/PlaylistChooser.vue"),
);

const snackbar = defineAsyncComponent(() =>
  import("./components/Snackbar.vue"),
);
import Searchbar from "./components/Searchbar.vue";
const selectionModal = defineAsyncComponent(() =>
  import("@/components/modals/SelectionModal.vue"),
);
import MusicPlayer from "./components/MusicPlayer.vue";
const feedbackModal = defineAsyncComponent(() =>
  import("./components/modals/FeedbackModal.vue"),
);
const shareModal = defineAsyncComponent(() =>
  import("./components/modals/ShareModal.vue"),
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
    InfoToggles,
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
body {
  margin: 0;
}

#navDrawer {
  background-color: #212121;
  border-right: 2px solid #da6a1d !important;
}

.musicPlayer {
  color: white;
  flex-grow: 1;
  max-width: 800px;
}

@media screen and (max-width: 500px) {
  .bottom {
    flex-direction: column;
  }
}

.bottom {
  position: absolute;
  z-index: 2;
  bottom: 1rem;
  left: 0px;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

a {
  color: inherit;
  text-decoration: inherit;
}

.topbar {
  position: fixed;
  background-color: #252525;
  gap: 1rem;
  color: white;
  display: flex;
  padding: 1rem;
  z-index: 2;
}

.login {
  background-color: #252525;
  padding: 0.5rem;
  border-radius: 4px;
  position: fixed;
  top: 1rem;
  right: 1rem;
  height: 30px;
  z-index: 2;
  display: flex;
  align-items: center;
}

.btn {
  color: white;
  background: #313131;
  border: 1px solid #2d9cdb;
  box-sizing: border-box;
  box-shadow: 1px 1px 4px rgba(45, 156, 219, 0.25);
  border-radius: 5px;
  padding: 3px;
  width: 100px;
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

.icon-btn {
  background: none;
  border: 1px solid #2d9cdb;
  border-radius: 5px;
  padding: 3px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: white;
}

.icon-btn:active {
  background: #2d9cdb;
}

.icon-btn:hover {
  background: linear-gradient(180deg, #2d9cdb 0%, #56ccf2 100%);
  color: black;
}
</style>
