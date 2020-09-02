<template>
  <div>
    <b-navbar type="dark" variant="info">
      <b-navbar-brand target="_blank" href="https://www.maylor.io/">maylor.io</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>


        <b-navbar-nav>
          <b-nav-item v-if="loggedIn" to="/">Dashboard</b-nav-item>
          <b-nav-item v-if="loggedIn" to="/search">Search</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
			<b-nav-item to="/about">About</b-nav-item>
          <SignUp v-if="!loggedIn" />
          <Login v-if="!loggedIn" />
          <Logout v-if="loggedIn" />
        </b-navbar-nav>

    </b-navbar>
  </div>
</template>

<script>
// const axios = require("axios");
import SignUp from "./SignUp.vue";
import Logout from "./Logout.vue";
import Login from "./Login.vue";

export default {
  name: "Navbar",
  components: {
    SignUp,
    Logout,
    Login
  },
  data() {
    return {};
  },
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    }
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
