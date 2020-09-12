<template>
  <div id="app">
    <Navbar />
    <router-view style="margin-top: 56px;" />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
export default {
  components: {
    Navbar
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: rgba(0, 0, 0, 0.25);
  color: #2c3e50;
  min-height: 100vh;
}

body {
  min-height: 100vh;
  background-image: url("https://images.unsplash.com/photo-1444212477490-ca407925329e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80");
  background-attachment: fixed;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
