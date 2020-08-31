<template>
  <b-nav-item @click="logout">Logout</b-nav-item>
</template>

<script>
export default {
  name: "Logout",
  methods: {
    logout() {
      this.$store.dispatch("destroyToken");
    }
  }
};
</script>
