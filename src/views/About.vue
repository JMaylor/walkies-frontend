<template>
	<div class="about">
		<Navbar />
		<UserSearch />
	</div>
</template>

<script>
	// @ is an alias to /src
	import Navbar from "@/components/Navbar.vue";
	import UserSearch from "@/components/UserSearch.vue";

	export default {
		name: "Home",
		components: {
			Navbar,
			UserSearch
		}
	};
</script>
