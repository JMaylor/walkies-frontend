<template>
	<div id="app">
		<router-view />
	</div>
</template>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		/* min-height: 100vh;
		height: 100%;
		width: 100%;
		background-color: #ffffff6e; */
		text-align: center;
		color: #2c3e50;
	}

	body {
		min-height: 100vh;
		height: 100%;
		background-image: url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80");
		background-attachment: fixed;
		background-size: cover;
		background-repeat: no-repeat;
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
