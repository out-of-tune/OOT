<template>
  <div v-if="show" class="snackbar" :class="color">
    {{ message }}
    <button class="btn" @click="retryExpand" v-if="message === 'expand failed'">
      Retry
    </button>
    <button class="btn snackbar-close" @click="show = false">Close</button>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      show: false,
      message: "",
    };
  },
  methods: {
    ...mapActions(["setMessage", "expandAction"]),
    retryExpand: function () {
      this.expandAction(this.$store.state.expand.failedNodes);
    },
  },
  computed: {
    ...mapState({
      color: (state) => state.snackbar.color,
    }),
  },
  created: function () {
    this.$store.watch(
      (state) => state.snackbar.message,
      () => {
        const msg = this.$store.state.snackbar.message;
        if (msg !== "") {
          this.show = true;
          this.message = this.$store.state.snackbar.message;

          this.setMessage("");
        }
      },
    );
  },
};
</script>

<style>
.snackbar {
  width: 90%;
  position: absolute;
  z-index: 2000;
  background-color: #424242;
  color: white;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  margin: 5%;
  box-shadow: white;
  border-radius: 5px;
}
.failure {
  border: 1px solid red;
}
.neutral {
  border: 1px solid white;
}
.success {
  border: 1px solid green;
}
.snackbar-close {
  align-self: end;
}
</style>
