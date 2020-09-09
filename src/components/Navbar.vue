<template>
	<div>
		<b-navbar type="dark" variant="dark" fixed="top">
			<b-navbar-brand target="_blank" href="https://www.maylor.io/">maylor.io</b-navbar-brand>

			<b-navbar-nav>
				<b-nav-item to="/">Home</b-nav-item>
				<b-nav-item v-if="loggedIn" to="/search">Search</b-nav-item>
				<b-nav-item to="/about">About</b-nav-item>

				<SignUp v-if="signUpModalVisible" v-on:close-modal="signUpModalVisible=false" />
				<b-nav-item v-if="!loggedIn" @click="signUpModalVisible = true">Register</b-nav-item>

				<Login v-if="loginModalVisible" v-on:close-modal="loginModalVisible=false" />
				<b-nav-item v-if="!loggedIn" @click="loginModalVisible = true">Login</b-nav-item>

				<Logout v-if="loggedIn" />

			</b-navbar-nav>
		</b-navbar>
	</div>
</template>

<script>
	import SignUp from "./Auth/SignUp.vue";
	import Logout from "./Logout.vue";
	import Login from "./Auth/Login.vue";

	export default {
		name: "Navbar",
		components: {
			SignUp,
			Logout,
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
		methods: {}
	};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
