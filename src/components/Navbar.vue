<template>
  <b-navbar type="dark" variant="dark" fixed="top">
    <b-navbar-brand target="_blank" href="https://www.maylor.io/"
      >maylor.io</b-navbar-brand
    >

    <b-navbar-brand to="/" class="main-branding">Walkies</b-navbar-brand>

    <b-navbar-nav>
      <b-nav-item to="/">Home</b-nav-item>
      <b-nav-item v-if="loggedIn" to="/search">Search</b-nav-item>
      <b-nav-item to="/about">About</b-nav-item>

      <SignUp
        v-if="signUpModalVisible"
        v-on:close-modal="signUpModalVisible = false"
      />
      <b-nav-item v-if="!loggedIn" @click="signUpModalVisible = true"
        >Register</b-nav-item
      >

      <Login
        v-if="loginModalVisible"
        v-on:close-modal="loginModalVisible = false"
      />
      <b-nav-item v-if="!loggedIn" @click="loginModalVisible = true"
        >Login</b-nav-item
      >

      <b-nav-item v-if="loggedIn" @click="logOut">Logout</b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
import SignUp from "./Auth/SignUp.vue";
import Login from "./Auth/Login.vue";

export default {
  name: "Navbar",
  components: {
    SignUp,
    Login
  },
  data() {
    return {
      loginModalVisible: false,
      signUpModalVisible: false
    };
  },
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch("destroyToken");
      this.$router.push({ name: "Home" });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import url("https://fonts.googleapis.com/css2?family=Pacifico&display=swap");
.main-branding {
  font-family: "Pacifico", cursive;
}
</style>
