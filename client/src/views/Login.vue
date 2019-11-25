<template>
  <div class="login">
    <!-- dev info -->
    <p>{{$store.state.authentication.accessToken}}</p>
    <p>{{$store.state.authentication.refreshToken}}</p>
    <p>{{$store.state.authentication.expiryTime}}</p>
    <p>{{$store.state.authentication.loginState}}</p>
    <h1>Me</h1>
    <p>{{$store.state.user.me}}</p>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import router from "@/router";

export default {
  name: "Login",

  methods: {
    ...mapActions(["setAccessToken", "setRefreshToken", "setExpiryTime", "getCurrentUser", "setError", "setSuccess"])
  },

  created() {
    const {
      access_token,
      refresh_token,
      expires_in,
      error
    } = this.$route.query;

    if (error) {
      this.setError(error)
    } else if (access_token && refresh_token && expires_in) {
      this.setRefreshToken(refresh_token);
      this.setExpiryTime(expires_in);
      this.setAccessToken(access_token);
      this.getCurrentUser()
      this.setSuccess("login successfull")
    }

    router.push("/");
  }
};
</script>
<style scoped>
div {
    margin: 200px;
}
</style>

