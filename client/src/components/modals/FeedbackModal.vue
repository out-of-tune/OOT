<template>
  <div>
    <div v-if="open" id="feedbackModal" class="modal">
      <div class="card">
        <v-icon @click="changeFeedbackModalState" class="close" icon="mdi-close" />
        <!-- TODO: add validation -->
        <form class="form">
          <label for="message">Mail:</label>
          <input type="text" id="mail" v-model="mail" :rules="emailRules" />
          <label for="message">Feedback:</label>
          <input type="text" id="message" v-model="feedback" />
          <button class="btn" @click="sendBetaFeedback">SEND</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  data: () => ({
    valid: false,
    mail: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
    ],
    feedback: "",
  }),
  computed: {
    ...mapState({
      open: (state) => state.feedback.feedbackModalOpen,
    }),
  },
  methods: {
    ...mapActions(["changeFeedbackModalState", "sendFeedback", "setError"]),
    sendBetaFeedback() {
      if (this.valid) {
        if (this.feedback.length > 0) {
          this.sendFeedback({
            mail: this.mail,
            feedback: this.feedback,
            group: "beta-tester",
          });
        } else {
          this.setError(new Error("Feedback is required!"));
        }
      } else {
        this.setError(new Error("Please enter a valid E-mail address!"));
      }
    },
  },
};
</script>
<style scoped>
/* The Modal (background) */
.modal {
  display: block;
  /* Hidden by default */
  position: fixed;
  /* Stay in place */
  z-index: 100;
  /* Sit on top */
  padding-top: 10%;
  /* Location of the box */
  padding-left: 10%;
  padding-right: 10%;
  left: 0;
  top: 0;
  width: 100%;
  /* Full width */
  height: 100%;
  /* Full height */
  overflow: auto;
  background-color: rgb(0, 0, 0);
  /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4);
  /* Black w/ opacity */
}

.card {
  color: white;
  border: 2px solid white;
  background-color: rgb(37, 37, 37);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;

  margin: 1rem;
  overflow-y: auto;
}

.close {
  grid-area: actions;
  position: sticky;
  top: 0;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  cursor: pointer;
  float: right;
  border-radius: 2px 0 0 0;
  box-shadow: -1px -1px -13px -6px rgba(0, 0, 0, 1);
}

.content {
  align-self: center;
  justify-self: center;
  display: grid;
}

.form {
  margin: 1rem;
}
</style>
