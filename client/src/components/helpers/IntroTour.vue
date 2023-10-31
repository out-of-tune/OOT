<template>
  <div>
    <div class="start-tour" v-if="showTour">
      <h2>Tour</h2>
      <p>
        Do you want to take a tour through out-of-tune? <br />
        We prepared a tutorial for you with all the basic knowledge you need! If
        you want a more extensive guide visit our
        <router-link class="link" :to="{ name: 'Help' }" target="_blank"
          >help page</router-link
        >.
      </p>
      <div class="buttons">
        <button class="btn" @click="setShowTour(false)">Skip tour</button>
        <button class="btn" @click="startTour">Start tour</button>
      </div>
    </div>
    <v-tour name="introTour" :steps="steps"></v-tour>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import IntroTour from "./IntroTour.js";

export default {
  data: () => {
    return {
      steps: IntroTour.steps,
      dialog: true,
    };
  },
  computed: {
    ...mapState({
      showTour: (state) => state.events.showTour,
    }),
  },
  methods: {
    ...mapActions(["setShowTour"]),
    startTour: function () {
      this.$tours["introTour"].start();
      this.setShowTour(false);
    },
  },
};
</script>

<style>
.v-step {
  z-index: 1000 !important;
  background-color: #404040 !important;
}
.start-tour {
  color: white;
  background-color: #252525;
  max-width: 300px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  position: absolute;
  z-index: 100;
  top: 100px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.buttons {
  display: flex;
  gap: 1rem;
}

.link {
  color: #1dcdda;
  cursor: pointer;
}
.link:hover {
  color: #da6a1d;
}
</style>
