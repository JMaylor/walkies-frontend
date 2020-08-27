<template>
	<div>
		<b-navbar toggleable="lg" type="dark" variant="info">
			<b-navbar-brand href="#">maylor.io</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item href="#">Find</b-nav-item>
					<b-nav-item to="/">Home</b-nav-item>
					<b-nav-item to="/about">About</b-nav-item>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<SignUp v-if="!loggedIn"/>
					<Login v-if="!loggedIn"/>
					<b-nav-item v-if="loggedIn" href="#">Profile</b-nav-item>
					<Logout v-if="loggedIn"/>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
	</div>
</template>

<script>
	// const axios = require("axios");
	import SignUp from './SignUp.vue'
	import Logout from './Logout.vue'
	import Login from './Login.vue'

	export default {
		name: "Navbar",
		components: {
			SignUp,
			Logout,
			Login
		},
		data() {
			return {

			};
		},
		computed: {
			loggedIn() {
				return this.$store.getters.loggedIn
			}
		},
		methods: {
		}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
