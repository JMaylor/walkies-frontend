<template>
  <div>
    <Navbar />
    <Info />
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/components/Navbar.vue";
import Info from "@/components/Info.vue";

export default {
  name: "About",
  components: {
    Navbar,
    Info
  }
};
</script>
