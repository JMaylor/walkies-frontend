<template>
  <div class="home">
    <Profile v-if="loggedIn" />
	<Promo v-if="!loggedIn" />
  </div>
</template>

<script>
// @ is an alias to /src
import Profile from "@/components/Profile.vue";
import Promo from "@/components/Promo.vue";

export default {
  name: "Home",
  components: {
	Profile,
	Promo
  },
  computed: {
    loggedIn() {
      return this.$store.getters.loggedIn;
    }
  }
};
</script>
