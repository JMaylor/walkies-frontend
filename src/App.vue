<template>
	<div id="app">
		<Navbar />
		<router-view style="margin-top: 56px;"/>
	</div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
export default {
	components: {
		Navbar
	}
}
</script>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: rgba(0, 0, 0, 0.25);
		text-align: center;
		color: #2c3e50;
		min-height: 100vh;
	}

	body {
		min-height: 100vh;
		background-image: url("https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80");
		background-attachment: fixed;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
	}

	#nav {
		padding: 30px;
	}

	#nav a {
		font-weight: bold;
		color: #2c3e50;
	}

	#nav a.router-link-exact-active {
		color: #42b983;
	}
</style>
