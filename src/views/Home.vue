<template>
	<div class="home">
		<Navbar />
		<Profile v-if="loggedIn" />
	</div>
</template>

<script>
	// @ is an alias to /src
	import Navbar from "@/components/Navbar.vue";
	import Profile from "@/components/Profile.vue";

	export default {
		name: "Home",
		components: {
			Navbar,
			Profile
		},
		computed: {
			loggedIn() {
				return this.$store.getters.loggedIn
			}
		}
	};
</script>
